import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getAdminSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('id_project');

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'id_project diperlukan.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('detail')
      .select('*')
      .eq('id_project', Number(projectId))
      .maybeSingle();

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
    const { id_project, deskripsi, role, fitur, teknologi } = body;

    if (!id_project) {
      return NextResponse.json({ success: false, error: 'id_project wajib diisi.' }, { status: 400 });
    }

    const formattedFitur = Array.isArray(fitur)
      ? fitur.map((f: string) => String(f).trim()).filter(Boolean)
      : typeof fitur === 'string'
      ? fitur.split('\n').map((f: string) => f.trim()).filter(Boolean)
      : [];

    const formattedTeknologi = Array.isArray(teknologi)
      ? teknologi.map((t: string) => String(t).trim()).filter(Boolean)
      : typeof teknologi === 'string'
      ? teknologi.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const supabase = getAdminSupabase();

    // Check if detail already exists for this project
    const { data: existing } = await supabase
      .from('detail')
      .select('id')
      .eq('id_project', Number(id_project))
      .maybeSingle();

    let result;
    if (existing?.id) {
      // Update existing detail
      result = await supabase
        .from('detail')
        .update({
          deskripsi: deskripsi?.trim() || '',
          role: role?.trim() || 'Fullstack Developer',
          fitur: formattedFitur,
          teknologi: formattedTeknologi,
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new detail
      result = await supabase
        .from('detail')
        .insert({
          id_project: Number(id_project),
          deskripsi: deskripsi?.trim() || '',
          role: role?.trim() || 'Fullstack Developer',
          fitur: formattedFitur,
          teknologi: formattedTeknologi,
        })
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Detail project berhasil disimpan!',
      data: result.data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan detail project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
