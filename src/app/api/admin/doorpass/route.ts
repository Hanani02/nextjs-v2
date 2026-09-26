import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputPass = body.pass?.trim();
    const expectedPass = process.env.LOGIN_DOORPASS || process.env.NEXT_PUBLIC_LOGIN_DOORPASS || 'kanagara-admin';

    if (!inputPass || inputPass !== expectedPass) {
      return NextResponse.json(
        { success: false, error: 'Door Pass tidak valid. Akses ditolak.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Door Pass terverifikasi.',
    });

    response.cookies.set('doorpass_token', 'unlocked', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada verifikasi door pass' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('doorpass_token')?.value;
  const isUnlocked = cookie === 'unlocked';
  return NextResponse.json({ unlocked: isUnlocked });
}
