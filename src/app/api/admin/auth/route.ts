import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const isEmpty = !error && count === 0;

    // Check session cookie
    const sessionCookie = req.cookies.get('admin_session')?.value;
    let user = null;
    if (sessionCookie) {
      try {
        user = JSON.parse(sessionCookie);
      } catch {
        user = null;
      }
    }

    return NextResponse.json({
      authenticated: !!user,
      user,
      isUsersTableEmpty: isEmpty,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const supabase = getSupabase();

    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { success: false, error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Login Action
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', trimmedEmail);

    if (selectError) {
      return NextResponse.json(
        { success: false, error: `Database error: ${selectError.message}` },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const matchedUser = users[0];

    // Check password
    if (matchedUser.password !== trimmedPassword) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    // Check role
    if (matchedUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Akun ini tidak memiliki akses administrator.' },
        { status: 403 }
      );
    }

    // Check email_verified if column exists
    if (matchedUser.email_verified === false) {
      return NextResponse.json(
        { success: false, error: 'Email belum diverifikasi. Hubungi administrator.' },
        { status: 403 }
      );
    }

    const sessionPayload = {
      id: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
    };

    const res = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: sessionPayload,
    });

    res.cookies.set('admin_session', JSON.stringify(sessionPayload), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logout berhasil' });
  res.cookies.delete('admin_session');
  return res;
}
