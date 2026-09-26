import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getAdminSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('experience')
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
    const { role, company, period, descriptions, technologies } = body;

    if (!role || !company) {
      return NextResponse.json(
        { success: false, error: 'Role dan nama company/institusi wajib diisi.' },
        { status: 400 }
      );
    }

    const formattedTech = Array.isArray(technologies)
      ? technologies.map((t: string) => String(t).trim()).filter(Boolean)
      : typeof technologies === 'string'
      ? technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('experience')
      .insert({
        role: role.trim(),
        company: company.trim(),
        period: period?.trim() || '2025 - present',
        descriptions: descriptions?.trim() || '',
        technologies: formattedTech,
      })
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Experience berhasil ditambahkan!',
      data: data && data[0] ? data[0] : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menambahkan experience';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, role, company, period, descriptions, technologies } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID experience diperlukan.' }, { status: 400 });
    }

    const formattedTech = Array.isArray(technologies)
      ? technologies.map((t: string) => String(t).trim()).filter(Boolean)
      : typeof technologies === 'string'
      ? technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('experience')
      .update({
        role: role?.trim(),
        company: company?.trim(),
        period: period?.trim(),
        descriptions: descriptions?.trim(),
        technologies: formattedTech,
      })
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
            'Gagal memperbarui: tidak ada baris yang berubah. Ini terjadi jika Row Level Security (RLS) di Supabase memblokir izin UPDATE untuk role anon. Buka Supabase SQL Editor dan jalankan: "ALTER TABLE experience DISABLE ROW LEVEL SECURITY;" atau tambahkan SUPABASE_SERVICE_ROLE_KEY di .env.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Experience berhasil diperbarui!',
      data: data[0],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui experience';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID experience diperlukan.' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { error } = await supabase.from('experience').delete().eq('id', Number(id));

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Experience berhasil dihapus!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus experience';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

