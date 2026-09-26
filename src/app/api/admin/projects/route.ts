import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getAdminSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('project')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      judul_project,
      deskripsi_project,
      image,
      tags,
      kategori,
      live_url,
      github_url,
      slug,
      detail,
    } = body;

    if (!judul_project || !deskripsi_project) {
      return NextResponse.json(
        { success: false, error: 'Judul dan deskripsi project wajib diisi.' },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug?.trim() ||
      judul_project
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') ||
      `project-${Date.now()}`;

    const formattedTags = Array.isArray(tags)
      ? tags.map((t: string) => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const supabase = getAdminSupabase();

    const insertPayload = {
      judul_project: judul_project.trim(),
      deskripsi_project: deskripsi_project.trim(),
      image: image?.trim() || '/image/auroraweb.png',
      tags: formattedTags,
      kategori: kategori?.trim() || 'web',
      live_url: live_url?.trim() || '',
      github_url: github_url?.trim() || null,
      slug: generatedSlug,
    };

    const { data: projectData, error: insertError } = await supabase
      .from('project')
      .insert(insertPayload)
      .select();

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          error:
            insertError.message ||
            'Gagal menambahkan project. Periksa policy RLS Supabase.',
        },
        { status: 500 }
      );
    }

    const createdProject = projectData && projectData[0] ? projectData[0] : null;

    // If detail project is provided, also insert into detail table
    if (detail && createdProject?.id) {
      const detailPayload = {
        id_project: createdProject.id,
        deskripsi: detail.deskripsi || deskripsi_project,
        role: detail.role || (kategori?.toLowerCase() === 'ui/ux' ? 'UI/UX Designer' : 'Fullstack Developer'),
        fitur: Array.isArray(detail.fitur) ? detail.fitur : [],
        teknologi: Array.isArray(detail.teknologi) ? detail.teknologi : formattedTags,
      };

      await supabase.from('detail').insert(detailPayload);
    }

    return NextResponse.json({
      success: true,
      message: 'Project berhasil ditambahkan!',
      data: createdProject,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memproses penambahan project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, judul_project, deskripsi_project, image, tags, kategori, live_url, github_url, slug } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID project diperlukan.' }, { status: 400 });
    }

    const formattedTags = Array.isArray(tags)
      ? tags.map((t: string) => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const updatePayload: Record<string, unknown> = {
      judul_project: judul_project?.trim(),
      deskripsi_project: deskripsi_project?.trim(),
      image: image?.trim(),
      tags: formattedTags,
      kategori: kategori?.trim(),
      live_url: live_url?.trim(),
      github_url: github_url ? github_url.trim() : null,
      slug: slug?.trim(),
    };

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('project')
      .update(updatePayload)
      .eq('id', Number(id))
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Gagal memperbarui: tidak ada baris yang berubah. Ini terjadi jika Row Level Security (RLS) di Supabase memblokir izin UPDATE untuk role anon. Buka Supabase SQL Editor dan jalankan: "ALTER TABLE project DISABLE ROW LEVEL SECURITY;" atau tambahkan SUPABASE_SERVICE_ROLE_KEY di .env.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project berhasil diperbarui!',
      data: data[0],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID project diperlukan.' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // First delete any detail rows referencing this project (due to FK constraint)
    await supabase.from('detail').delete().eq('id_project', Number(id));

    // Then delete the project
    const { error } = await supabase.from('project').delete().eq('id', Number(id));

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Project berhasil dihapus!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
