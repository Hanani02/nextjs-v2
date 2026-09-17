# Penjelasan Pengembangan Website Portofolio

## Ringkasan

Website ini merupakan portofolio pribadi yang menampilkan profil, pengalaman, project, dan informasi kontak. Data project dan pengalaman sekarang tidak lagi bergantung pada data statis di dalam source code, tetapi sudah terhubung ke Supabase. Pada pengembangan versi ini, saya menambahkan fitur detail project, merapikan pengelolaan data, membuat splash screen, meningkatkan tampilan responsif, serta menyempurnakan antarmuka menggunakan Tailwind CSS.

## Fitur yang Ditambahkan

### 1. Halaman Detail Project

Pada setiap kartu project ditambahkan tombol **Detail** melalui komponen `ProjectCard.tsx`. Tombol tersebut mengarahkan pengguna ke halaman detail berdasarkan `slug` project.

Halaman detail berada di `src/app/Project/[slug]/page.tsx` dan menampilkan:

- Judul dan kategori project.
- Gambar project.
- Deskripsi project.
- Role atau peran yang dikerjakan.
- Teknologi yang digunakan.
- Daftar fitur project.
- Link menuju project online dan repository GitHub jika tersedia.
- Tombol untuk kembali ke daftar project.

Rute halaman detail menggunakan dynamic route `[slug]` yang berada langsung di dalam folder `Project`. Format URL yang digunakan adalah `/Project/nama-project`, contohnya `/Project/simmas`. Nilai `slug` dari URL dibaca melalui `params` dan digunakan untuk mencari project secara langsung dari tabel `project` di Supabase. Jika slug berupa angka, halaman juga menyediakan fallback pencarian berdasarkan `id`.

Jika `slug` tidak ditemukan atau project tidak tersedia, halaman akan memanggil `notFound()` sehingga pengguna diarahkan ke halaman 404.

### 2. Integrasi Supabase dan Data Dinamis

Project list diambil dari tabel `project`, sedangkan informasi tambahan seperti role, fitur, dan teknologi diambil dari tabel `detail`. Halaman pengalaman mengambil data dari tabel `experience`. Setiap halaman melakukan query server-side menggunakan Supabase sehingga perubahan data di dashboard/database dapat tampil di website tanpa mengubah source code atau melakukan hardcode ulang.

Koneksi Supabase menggunakan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang disimpan di file environment. Route detail project diberi konfigurasi `force-dynamic` agar Next.js selalu mengambil data terbaru dari Supabase ketika halaman diminta, bukan menyimpan hasil sebagai halaman statis saat build.

Data lama di `src/data/data.ts` masih dapat digunakan sebagai referensi atau data lokal, tetapi tidak lagi menjadi sumber utama untuk daftar project dan pengalaman yang ditampilkan di website.

#### Konfigurasi deployment

File `.env` lokal tidak ikut ter-upload ke Vercel. Karena itu, kedua environment variable berikut harus ditambahkan secara manual di **Vercel Project Settings → Environment Variables** untuk environment `Production` (dan `Preview` jika diperlukan):

```env
NEXT_PUBLIC_SUPABASE_URL=https://nama-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Setelah menambahkan atau mengubah variable, lakukan redeploy agar konfigurasi baru digunakan. Client Supabase dibuat secara lazy melalui `src/lib/supabase.ts`, sehingga proses build tidak lagi gagal hanya karena module Supabase dievaluasi sebelum environment variable tersedia. Jika variable tetap tidak diatur pada deployment, halaman yang membutuhkan database akan menampilkan error konfigurasi saat runtime.

### 3. Splash Screen

Saya menambahkan komponen `SplashScreen` yang muncul ketika website pertama kali dibuka. Splash screen menampilkan identitas Kanagara Studio, ikon kode, animasi logo, dan garis progress.

Animasi dibuat menggunakan Framer Motion. Setelah durasi animasi selesai, splash screen menghilang dan halaman utama ditampilkan.

### 4. AppShell untuk Mengatur Tampilan Awal

Komponen `AppShell.tsx` digunakan sebagai pembungkus utama aplikasi. Komponen ini mengatur urutan tampilan sebagai berikut:

1. Menampilkan splash screen.
2. Menunggu splash screen selesai.
3. Menampilkan navbar dan isi halaman.

Dengan alur ini, navbar tidak muncul sebelum splash screen selesai ditampilkan.

### 5. Halaman Not Found

Saya menambahkan halaman 404 kustom melalui `src/app/not-found.tsx`. Halaman ini ditampilkan ketika pengguna membuka alamat yang tidak tersedia atau mencoba mengakses project dengan `slug` yang salah.

Halaman 404 memiliki pesan kesalahan, tampilan visual khusus, serta tombol untuk kembali ke halaman utama atau melihat daftar project.

## Komponen yang Ditambahkan atau Dikembangkan

- `src/components/SplashScreen/page.tsx`: menampilkan splash screen dengan animasi pembuka.
- `src/components/layouts/AppShell.tsx`: mengatur splash screen, navbar, dan isi halaman.
- `src/components/project/ProjectCard.tsx`: menampilkan kartu project beserta tombol Detail, Live, dan GitHub.
- `src/app/Project/[slug]/page.tsx`: menampilkan informasi lengkap dari satu project berdasarkan dynamic route `slug` dan data Supabase.
- `src/app/not-found.tsx`: menampilkan halaman 404 kustom.
- `src/lib/supabase.ts`: membuat client Supabase yang digunakan untuk mengambil data dari database.

## Penerapan Tailwind CSS

Tailwind CSS digunakan untuk menyempurnakan tampilan dan layout website tanpa membuat banyak file CSS terpisah. Beberapa penerapannya adalah:

- Mengatur warna latar belakang, teks, border, surface, dan warna utama melalui tema di `src/app/globals.css`.
- Mengatur jarak, ukuran, posisi, dan alignment elemen menggunakan utility class.
- Membuat layout responsif menggunakan breakpoint seperti `md` dan `lg`.
- Membuat kartu project dengan border, rounded corner, shadow, dan efek hover.
- Membuat tombol dan link dengan perubahan warna serta transisi saat diarahkan dengan kursor.
- Mengatur gambar project agar tetap proporsional menggunakan `next/image` dan class seperti `object-cover`.
- Membuat layout halaman detail menjadi satu kolom pada layar kecil dan dua kolom pada layar besar.
- Mengatur tampilan navbar pada halaman 404 agar tidak mengganggu fokus halaman error.

Selain Tailwind CSS, website ini juga menggunakan Framer Motion untuk animasi splash screen dan React Icons untuk ikon pada tombol serta link.

## Perbaikan Responsif

Tampilan website disesuaikan untuk berbagai ukuran layar, mulai dari perangkat mobile hingga desktop. Penyesuaian dilakukan pada ukuran teks, jarak antar elemen, tinggi gambar, susunan kartu, tombol, navbar, dan layout halaman detail project.