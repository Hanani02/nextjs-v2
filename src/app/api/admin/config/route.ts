import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig } from '@/lib/site-config';

export async function GET() {
  const config = getSiteConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveSiteConfig(body);
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
