import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSiteConfigAsync, saveSiteConfigAsync } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getSiteConfigAsync();
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat konfigurasi';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await saveSiteConfigAsync(body);

    // Revalidate paths agar teks yang diedit langsung ter-update di tampilan web
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/Admin', 'page');
      revalidatePath('/Admin/Contact', 'page');
      revalidatePath('/Admin/Hero', 'page');
      revalidatePath('/Admin/About', 'page');
    } catch (e) {
      console.warn('revalidatePath warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi berhasil disimpan!',
      config: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan konfigurasi';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

