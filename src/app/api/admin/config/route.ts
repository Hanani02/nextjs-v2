import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfigAsync, saveSiteConfigAsync } from '@/lib/site-config';

export async function GET() {
  try {
    const config = await getSiteConfigAsync();
    return NextResponse.json(config);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat konfigurasi';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await saveSiteConfigAsync(body);
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

