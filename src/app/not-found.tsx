import Link from 'next/link';

export default function notFound() {
  return (
    <main className="not-found-page relative mt-8 flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative w-full max-w-2xl text-center">
        <div className="mb-8 flex justify-center" aria-hidden="true">
          <div className="relative flex h-24 w-24 rotate-[-4deg] items-center justify-center rounded-4xl border border-primary/40 bg-card shadow-[8px_8px_0_rgba(59,130,246,0.18)]">
            <span className="absolute left-6 top-9 h-2.5 w-2.5 rounded-full bg-text" />
            <span className="absolute right-6 top-9 h-2.5 w-2.5 rounded-full bg-text" />
            <span className="absolute bottom-5 h-2 w-7 rounded-b-full border-b-2 border-primary" />
            <span className="absolute -right-5 -top-4 rotate-12 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-background">404!</span>
          </div>
        </div>

        <p className="mb-3 font-mono text-sm font-semibold uppercase tracking-[0.28em] text-primary">Oops, route nyasar</p>
        <h1 className="text-8xl font-extrabold leading-none tracking-tight text-text sm:text-9xl">404</h1>
        <h2 className="mt-5 text-2xl font-bold text-text sm:text-3xl">Halaman ini sedang main petak umpet.</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/60 sm:text-base">
          Sepertinya alamat yang kamu cari tersesat di internet. Tenang, proyek-proyek keren masih menunggu di tempatnya.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-card/80 p-4 text-left font-mono text-xs text-white/50 shadow-xl">
          <p><span className="text-primary">guest@portfolio</span>:~$ find halaman</p>
          <p className="mt-2 text-red-300">find: halaman: No such file or directory</p>
          <p className="mt-2 text-white/70">Tip: coba jalur yang lebih masuk akal.</p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/#projects"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:-translate-y-0.5 hover:bg-blue-400"
          >
            Lihat Projects <span className="ml-2" aria-hidden="true">-&gt;</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-semibold text-text transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            Kembali ke Home
          </Link>
        </div>
      </div>
    </main>
  )
}
