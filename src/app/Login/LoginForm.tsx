'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuEye, LuEyeOff, LuArrowLeft, LuCircleCheck, LuCircleAlert } from 'react-icons/lu';
import { getSupabase } from '@/lib/supabase';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data: users, error } = await supabase
        .from('users')
        .select('email,password,role,email_verified');

      const data = users?.find(
        (user) =>
          user.email.trim().toLowerCase() === email.trim().toLowerCase()
      );

      if (error) {
        setError('Terjadi masalah saat mengakses database.');
        setLoading(false);
        return;
      }

      if (!data) {
        setError('Email tidak ditemukan.');
        setLoading(false);
        return;
      }

      if (data.password !== password.trim()) {
        setError('Password salah.');
        setLoading(false);
        return;
      }

      if (data.role !== 'admin') {
        setError('Akun ini bukan admin.');
        setLoading(false);
        return;
      }

      if (data.email_verified === false) {
        setError('Email belum diverifikasi.');
        setLoading(false);
        return;
      }

      setSuccess('Login berhasil!');
      const sessionUser = { email: data.email, role: data.role };
      localStorage.setItem('user', JSON.stringify(sessionUser));
      document.cookie = `admin_session=${encodeURIComponent(JSON.stringify(sessionUser))}; path=/; max-age=604800; SameSite=Lax`;
      setTimeout(() => {
        router.push('/Admin');
        router.refresh();
      }, 600);
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background text-text overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl bg-primary/10 pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition">
            <LuArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <span className="text-[11px] font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-border">Admin Portal</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Login Admin
          </h1>
          <p className="text-sm text-gray-400">
            Masuk untuk mengelola portofolio Anda.
          </p>
        </div>

        {/* Notifikasi Gagal (Merah) dengan padding lapang */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm shadow-sm transition-all animate-in fade-in duration-200">
            <LuCircleAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Notifikasi Berhasil (Hijau) dengan padding lapang */}
        {success && (
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm shadow-sm transition-all animate-in fade-in duration-200">
            <LuCircleCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="leading-snug">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-text placeholder:text-gray-500 text-sm outline-none focus:border-primary transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 block">Password</label>
            <div className="flex items-center rounded-lg bg-background border border-border focus-within:border-primary transition">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="flex-1 px-4 py-2.5 bg-transparent text-text placeholder:text-gray-500 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-gray-400 hover:text-text cursor-pointer transition flex items-center justify-center"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-gray-100 font-medium hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
