export type Language = 'id' | 'en';

export interface TranslationDictionary {
  // Navigation
  nav_home: string;
  nav_about: string;
  nav_projects: string;
  nav_experience: string;
  nav_contact: string;
  nav_download_cv: string;
  nav_race_sound: string;
  nav_theme: string;
  nav_language: string;
  nav_menu: string;

  // Hero Section
  hero_greeting: string;
  hero_roles: string;
  hero_headline: string;
  hero_headline_highlight: string;
  hero_description: string;
  hero_cta_contact: string;
  hero_cta_projects: string;
  hero_play_game: string;

  // Marquee
  marquee_status: string;

  // About Section
  about_badge: string;
  about_title: string;
  about_desc1: string;
  about_desc2: string;
  about_highlight_code: string;
  about_highlight_fullstack: string;
  about_highlight_performance: string;

  // Projects Section
  projects_badge: string;
  projects_title: string;
  projects_title_highlight: string;
  projects_description: string;
  projects_filter_all: string;
  projects_search_placeholder: string;
  projects_total: string;
  projects_view_detail: string;
  projects_live_demo: string;
  projects_view_all: string;
  projects_empty: string;
  projects_header_title: string;
  projects_header_desc: string;
  projects_back_home: string;

  // Experience Section
  exp_badge: string;
  exp_title: string;
  exp_title_highlight: string;
  exp_description: string;

  // Contact Section
  contact_badge: string;
  contact_title: string;
  contact_title_highlight: string;
  contact_description: string;
  contact_form_title: string;
  contact_form_name: string;
  contact_form_name_placeholder: string;
  contact_form_email: string;
  contact_form_email_placeholder: string;
  contact_form_message: string;
  contact_form_message_placeholder: string;
  contact_form_submit: string;
  contact_form_sending: string;
  contact_form_success: string;
  contact_form_error: string;
  contact_info_title: string;
  contact_info_email: string;
  contact_info_phone: string;
  contact_info_location: string;

  // Footer
  footer_tagline: string;
  footer_navigation: string;
  footer_social: string;
  footer_copyright: string;

  // Game
  game_return_home: string;
  game_return_home_long: string;
  game_garage: string;
  game_drift: string;
  game_reset: string;
  game_tuning: string;
  game_monza_radar: string;
  game_lap: string;
  game_finish: string;
  game_steer_left: string;
  game_steer_right: string;
  game_reverse: string;
  game_gas: string;
  game_chat_title: string;
  game_chat_placeholder: string;
  game_chat_open: string;
  game_chat_close: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  id: {
    // Navigation
    nav_home: 'Beranda',
    nav_about: 'Tentang',
    nav_projects: 'Proyek',
    nav_experience: 'Pengalaman',
    nav_contact: 'Kontak',
    nav_download_cv: 'Unduh CV',
    nav_race_sound: 'Suara Balapan',
    nav_theme: 'Tema Tampilan',
    nav_language: 'Pilih Bahasa',
    nav_menu: 'Menu',

    // Hero Section
    hero_greeting: "── Halo, saya M. Akbar Hanani",
    hero_roles: 'Fullstack Developer | Web Developer | Mobile Developer',
    hero_headline: 'Membangun pengalaman web modern dengan',
    hero_headline_highlight: 'kode bersih',
    hero_description: 'Saya merancang dan membangun aplikasi fullstack yang scalable menggunakan teknologi modern seperti Next.js, TypeScript, dan Supabase. Berfokus pada performa tinggi dan UI yang bersih.',
    hero_cta_contact: 'Hubungi Saya',
    hero_cta_projects: 'Lihat Proyek',
    hero_play_game: 'Mainkan Game Balapan 3D',

    // Marquee
    marquee_status: 'Tersedia untuk Pekerjaan Lepas & Kolaborasi Proyek',

    // About Section
    about_badge: 'Tentang Saya',
    about_title: 'Membangun aplikasi web yang scalable dan berorientasi pada pengguna',
    about_desc1: "Saya siswa kelas 11 Rekayasa Perangkat Lunak (RPL) di SMKN 1 Kota Pasuruan, bersemangat membangun aplikasi web yang lancar, modern, dan ramah pengguna. Saya senang mengubah ide menjadi pengalaman digital yang fungsional sembari terus meningkatkan keterampilan pengembangan dan desain melalui proyek sekolah dan pribadi.",
    about_desc2: "Saya sering bekerja dengan HTML, CSS, JavaScript, TypeScript, React, Next.js, dan Tailwind CSS, serta MySQL dan dasar Python. Untuk desain dan pembuatan antarmuka, saya biasa menggunakan Figma dan shadcn/ui demi menciptakan pengalaman yang bersih, responsif, dan konsisten.",
    about_highlight_code: 'Kode Bersih',
    about_highlight_fullstack: 'Aplikasi Fullstack',
    about_highlight_performance: 'Performa Tinggi',

    // Projects Section
    projects_badge: 'Proyek',
    projects_title: 'Koleksi karya dan proyek',
    projects_title_highlight: 'terbaru saya',
    projects_description: 'Pilihan proyek yang menampilkan kemampuan saya dalam merancang, membangun, dan mengembangkan aplikasi fullstack modern.',
    projects_filter_all: 'Semua',
    projects_search_placeholder: 'Cari proyek berdasarkan judul, tag, atau kategori...',
    projects_total: 'Total proyek',
    projects_view_detail: 'Lihat Detail',
    projects_live_demo: 'Kunjungi Web',
    projects_view_all: 'Lihat Semua Proyek',
    projects_empty: 'Tidak ada proyek yang sesuai dengan pencarian Anda.',
    projects_header_title: 'Koleksi karya yang telah saya bangun.',
    projects_header_desc: 'Jelajahi semua proyek yang telah saya buat untuk belajar, bereksperimen, dan menghadirkan pengalaman digital terbaik.',
    projects_back_home: 'Kembali ke Beranda',

    // Experience Section
    exp_badge: 'Pengalaman',
    exp_title: 'Pengalaman yang',
    exp_title_highlight: 'membuktikan dedikasi',
    exp_description: 'Menjelajahi perjalanan saya sebagai pengembang, dari mempelajari dasar-dasar pemrograman hingga membangun aplikasi fullstack siap pakai.',

    // Contact Section
    contact_badge: 'Kontak',
    contact_title: 'Mari bangun sesuatu yang',
    contact_title_highlight: 'luar biasa bersama',
    contact_description: 'Punya ide proyek, tawaran kolaborasi, atau ingin berdiskusi? Saya siap mendengarnya. Mari terhubung!',
    contact_form_title: 'Kirim Pesan',
    contact_form_name: 'Nama Lengkap',
    contact_form_name_placeholder: 'Tulis nama Anda di sini',
    contact_form_email: 'Alamat Email',
    contact_form_email_placeholder: 'contoh@email.com',
    contact_form_message: 'Pesan Anda',
    contact_form_message_placeholder: 'Ceritakan tentang ide proyek Anda...',
    contact_form_submit: 'Kirim Pesan',
    contact_form_sending: 'Mengirim pesan...',
    contact_form_success: 'Pesan Anda berhasil dikirim! Saya akan segera merespons.',
    contact_form_error: 'Gagal mengirim pesan. Silakan coba lagi atau hubungi via WhatsApp.',
    contact_info_title: 'Informasi Kontak',
    contact_info_email: 'Email',
    contact_info_phone: 'Telepon / WhatsApp',
    contact_info_location: 'Lokasi',

    // Footer
    footer_tagline: 'Menciptakan pengalaman web modern dan skalabel dengan kode bersih serta desain yang terencana.',
    footer_navigation: 'Navigasi',
    footer_social: 'Media Sosial',
    footer_copyright: 'Hak Cipta Dilindungi.',

    // Game
    game_return_home: 'Kembali ke Beranda',
    game_return_home_long: 'Kembali ke Halaman Awal',
    game_garage: 'Cyber Garage',
    game_drift: 'DRIFT',
    game_reset: 'Reset Posisi',
    game_tuning: 'Pengaturan Kemudi',
    game_monza_radar: 'RADAR MONZA',
    game_lap: 'PUTARAN',
    game_finish: 'SELESAI',
    game_steer_left: 'Belok Kiri',
    game_steer_right: 'Belok Kanan',
    game_reverse: 'Mundur',
    game_gas: 'Gas Maju',
    game_chat_title: 'Obrolan Balapan',
    game_chat_placeholder: 'Ketik pesan... (Enter kirim, Esc batal)',
    game_chat_open: 'Buka Chat',
    game_chat_close: 'Tutup Chat',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_about: 'About',
    nav_projects: 'Projects',
    nav_experience: 'Experience',
    nav_contact: 'Contact',
    nav_download_cv: 'Download CV',
    nav_race_sound: 'Race Sound',
    nav_theme: 'Display Theme',
    nav_language: 'Language',
    nav_menu: 'Menu',

    // Hero Section
    hero_greeting: "── Hello I'm M. Akbar Hanani",
    hero_roles: 'Fullstack Developer | Web Developer | Mobile Developer',
    hero_headline: 'Building modern web experience with',
    hero_headline_highlight: 'clean code',
    hero_description: 'I design and build scalable fullstack applications using modern technologies like Next.js, TypeScript, and Supabase. Focused on performance and clean UI.',
    hero_cta_contact: 'Get In Touch',
    hero_cta_projects: 'View Projects',
    hero_play_game: 'Play 3D Racing Game',

    // Marquee
    marquee_status: 'Available for Freelance & Collaborative Projects',

    // About Section
    about_badge: 'About Me',
    about_title: 'I build scalable and user-focused web applications',
    about_desc1: "I'm a Grade 11 Software Engineering (RPL) student at SMKN 1 Kota Pasuruan, passionate about building smooth, modern, and user-friendly web applications. I enjoy turning ideas into functional digital experiences while continuously improving my development and design skills through school and personal projects.",
    about_desc2: "I frequently work with HTML, CSS, JavaScript, TypeScript, React, Next.js, and Tailwind CSS, along with MySQL and basic Python. For design and interface development, I often use Figma and shadcn/ui to create clean, responsive, and consistent experiences.",
    about_highlight_code: 'Clean Code',
    about_highlight_fullstack: 'Fullstack Apps',
    about_highlight_performance: 'High Performance',

    // Projects Section
    projects_badge: 'Projects',
    projects_title: 'Some of my recent',
    projects_title_highlight: 'work',
    projects_description: 'A selection of projects showcasing my ability to design, build, and scale modern fullstack applications.',
    projects_filter_all: 'All',
    projects_search_placeholder: 'Search projects by title, tags, or category...',
    projects_total: 'Total projects',
    projects_view_detail: 'View Detail',
    projects_live_demo: 'Live Demo',
    projects_view_all: 'View All Projects',
    projects_empty: 'No projects found matching your search query.',
    projects_header_title: "A collection of works that I've made.",
    projects_header_desc: "Explore all the projects I've built to learn, experiment, and create better digital experiences.",
    projects_back_home: 'Back to Home',

    // Experience Section
    exp_badge: 'Experience',
    exp_title: 'Experience that',
    exp_title_highlight: 'speaks volumes',
    exp_description: 'Exploring my journey as a developer, from learning the fundamentals to building production-ready fullstack applications.',

    // Contact Section
    contact_badge: 'Contact',
    contact_title: "Let's build something",
    contact_title_highlight: 'great together',
    contact_description: "Have a project in mind, a collaboration offer, or just want to chat? I'd love to hear about it. Let's connect!",
    contact_form_title: 'Send a Message',
    contact_form_name: 'Full Name',
    contact_form_name_placeholder: 'Enter your full name',
    contact_form_email: 'Email Address',
    contact_form_email_placeholder: 'example@email.com',
    contact_form_message: 'Your Message',
    contact_form_message_placeholder: 'Tell me about your project or inquiry...',
    contact_form_submit: 'Send Message',
    contact_form_sending: 'Sending message...',
    contact_form_success: 'Your message has been sent successfully! I will get back to you soon.',
    contact_form_error: 'Failed to send message. Please try again or reach out directly via WhatsApp.',
    contact_info_title: 'Contact Information',
    contact_info_email: 'Email',
    contact_info_phone: 'Phone / WhatsApp',
    contact_info_location: 'Location',

    // Footer
    footer_tagline: 'Crafting modern, scalable web experiences with clean code and thoughtful design.',
    footer_navigation: 'Navigation',
    footer_social: 'Social Media',
    footer_copyright: 'All Rights Reserved.',

    // Game
    game_return_home: 'Back to Home',
    game_return_home_long: 'Return to Home Page',
    game_garage: 'Cyber Garage',
    game_drift: 'DRIFT',
    game_reset: 'Reset Position',
    game_tuning: 'Handling Tuning',
    game_monza_radar: 'MONZA RADAR',
    game_lap: 'LAP',
    game_finish: 'FINISH',
    game_steer_left: 'Steer Left',
    game_steer_right: 'Steer Right',
    game_reverse: 'Reverse',
    game_gas: 'Accelerate',
    game_chat_title: 'Race Chat',
    game_chat_placeholder: 'Type a message... (Enter to send, Esc to cancel)',
    game_chat_open: 'Open Chat',
    game_chat_close: 'Close Chat',
  },
};
