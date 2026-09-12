# Penjelasan Pengembangan Website Portofolio

## Ringkasan

Website ini merupakan portofolio pribadi yang menampilkan profil, pengalaman, project, dan informasi kontak. Pada pengembangan versi ini, saya menambahkan fitur detail project, merapikan pengelolaan data, membuat splash screen, meningkatkan tampilan responsif, serta menyempurnakan antarmuka menggunakan Tailwind CSS.

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

Rute halaman detail menggunakan dynamic route `[slug]` yang berada langsung di dalam folder `Project`. Format URL yang digunakan adalah `/Project/nama-project`, contohnya `/Project/simmas`. Nilai `slug` dari URL dibaca melalui `params` dan digunakan untuk mencari project yang sesuai di dalam data `projects` pada `src/data/data.ts`.

Jika `slug` tidak ditemukan atau project tidak tersedia, halaman akan memanggil `notFound()` sehingga pengguna diarahkan ke halaman 404.

### 2. Pengelolaan Data Terpusat

Data project, pengalaman, dan informasi tambahan project dipisahkan ke dalam `src/data/data.ts`. Pemisahan ini membuat data lebih rapi, mudah diperbarui, dan dapat digunakan oleh beberapa komponen tanpa menulis ulang data yang sama.

Data project menggunakan beberapa properti, seperti `slug`, `title`, `description`, `image`, `tags`, `kategori`, `liveUrl`, dan `githubUrl`.

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
- `src/app/Project/[slug]/page.tsx`: menampilkan informasi lengkap dari satu project berdasarkan dynamic route `slug`.
- `src/app/not-found.tsx`: menampilkan halaman 404 kustom.
- `src/data/data.ts`: menyimpan data project, pengalaman, dan detail project secara terpusat.

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