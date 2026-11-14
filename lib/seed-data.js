/**
 * Data kurasi terverifikasi Usvandre Nur (non-fiksi: esai, web, produksi visual, & rekam jejak).
 * Digunakan sebagai sumber seed SQL Supabase sekaligus fallback lokal saat env DB belum diisi.
 */
const PROFILE = {
  name: "Usvandre Nur",
  shortName: "Vandre",
  brandWordmark: "usvandre.",
  tagline: "Menulis Gagasan. Merancang Antarmuka. Merekam Visual.",
  location: "Batubara, Sumatera Utara, Indonesia",
  email: "usvanndrenur@gmail.com",
  substackUrl: "https://substack.com/@vandroidd",
  substackHandle: "@vandroidd",
  threadsUrl: "https://www.threads.com/@usvandrnr",
  threadsHandle: "@usvandrnr",
  education: "S1 Ilmu Komunikasi — Universitas Terbuka (UPBJJ-UT Medan) · Alumni RPL SMKN 1 Air Putih",
  certification: "BNSP Junior Web Developer (LSP Teknologi Informasi Nusantara, 2024)"
};

const CATEGORIES = [
  "Semua",
  "Esai & Opini",
  "Teknologi & Web",
  "Produksi Visual",
  "Buku & Literasi"
];

const POSTS = [
  {
    slug: "laut-bercerita-sejarah-1998",
    category: "Esai & Opini",
    featured: true,
    published_year: "2026",
    read_time: "6 menit baca",
    title: "Laut Bercerita: Mengapa Generasi Muda Tidak Boleh Melupakan Sejarah 1998?",
    excerpt:
      "Diangkat dari naskah Public Speaking FSIK4103 di Universitas Terbuka: membaca ulang kisah sejarah 1998 sebagai pengingat bahwa kebebasan bersuara lahir dari pengorbanan yang nyata.",
    tags: ["Public Speaking", "Ilmu Komunikasi", "Sastra Indonesia", "1998"],
    source_note: "Naskah Pidato FSIK4103 — S1 Ilmu Komunikasi FHISIP Universitas Terbuka",
    body: [
      "Ketika menikmati kebebasan berpendapat hari ini, kita jarang bertanya berapa harga yang pernah dibayar untuk mewujudkannya. Novel Laut Bercerita karya Leila S. Chudori membuka pintu ingatan menuju tahun 1998—masa ketika sejumlah aktivis mahasiswa dihilangkan paksa hanya karena menuntut keadilan.",
      "Tokoh Biru Laut dan rekan-rekannya dalam kisah itu memang lahir dari imajinasi sastra, tetapi luka sosial yang melatarbelakanginya berakar pada fakta sejarah. Laporan Komnas HAM serta Komnas Perempuan mencatat bahwa hingga kini masih ada korban penghilangan paksa 1997–1998 yang belum kembali kepada keluarganya.",
      "Sebagai mahasiswa Ilmu Komunikasi, saya memandang karya tersebut bukan sekadar bacaan sastra sejarah. Ia bekerja sebagai medium komunikasi publik yang menjembatani arsip sejarah yang dingin dengan empati generasi muda.",
      "Ada tiga alasan utama mengapa generasi hari ini perlu merawat ingatan tersebut. Pertama, kebebasan berekspresi bukan hadiah yang datang tiba-tiba, melainkan hak yang diperjuangkan dengan nyawa dan kehilangan. Kedua, tanpa kesadaran sejarah, kita rentan mengulangi kesalahan serupa dalam rupa yang berbeda.",
      "Ketiga, empati warga negara tumbuh saat kita berani menengok sisi gelap masa lalu bangsa, lalu menjadikannya tolok ukur etika bermasyarakat. Merawat ingatan bukan berarti memelihara dendam; merawat ingatan berarti menolak abai agar ruang demokrasi tetap hidup bagi siapa saja."
    ]
  },
  {
    slug: "dari-rpl-ke-ilmu-komunikasi",
    category: "Esai & Opini",
    featured: false,
    published_year: "2025",
    read_time: "5 menit baca",
    title: "Dari Rekayasa Perangkat Lunak ke Ilmu Komunikasi: Menggabungkan Logika dan Narasi",
    excerpt:
      "Lulus dari jurusan RPL SMKN 1 Air Putih dan mengantongi sertifikat BNSP Junior Web Developer menjadi pijakan untuk memahami cara manusia bertukar gagasan.",
    tags: ["Refleksi", "Ilmu Komunikasi", "RPL", "Karier"],
    source_note: "Catatan perjalanan studi dan minat lintas disiplin",
    body: [
      "Banyak orang mengira berpindah jalur dari Rekayasa Perangkat Lunak ke Ilmu Komunikasi berarti meninggalkan dunia teknis. Padahal, keduanya sama-sama mengajarkan satu hal mendasar: merancang struktur agar pesan dapat diterima tanpa gangguan.",
      "Sewaktu belajar di SMKN 1 Air Putih pada periode 2021–2024, saya terbiasa menyusun basis data, menuliskan kode antarmuka web, hingga mengikuti LKS Web Design tingkat provinsi dan meraih sertifikasi kompetensi Junior Web Developer dari BNSP pada April 2024.",
      "Di sela jam praktik laboratorium, saya banyak menghabiskan waktu menyunting video dengan Adobe After Effects dan Premiere Pro. Kebiasaan menyusun potongan gambar, ritme audio, dan tipografi membuat saya sadar bahwa teknologi membutuhkan narasi agar terasa hidup.",
      "Pengalaman membuat video pengenalan sekolah serta bekerja sebagai editor video di studio Indrapura dan produksi konten komersial mempertajam kesadaran bahwa perangkat hanyalah wadah. Kekuatan sejati sebuah karya tetap bergantung pada kejelasan pesan yang dibawanya.",
      "Pilihan kuliah di S1 Ilmu Komunikasi Universitas Terbuka menjadi titik temu alami. Ilmu kode melatih logika terstruktur, sedangkan ilmu komunikasi mengasah kepekaan terhadap audiens dan makna."
    ]
  },
  {
    slug: "ritme-video-komersial-dan-studio",
    category: "Produksi Visual",
    featured: true,
    published_year: "2025",
    read_time: "6 menit baca",
    title: "Merangkai Ritme Video 40 Detik: Catatan Produksi Kopi TM 100, RM 100, dan Studio",
    excerpt:
      "Dari menyunting tiga sampai empat video pernikahan per hari hingga mengemas klip multicam komersial berdurasi 35–40 detik, setiap detik di timeline menuntut ketelitian alur.",
    tags: ["Video Editing", "Kopi TM 100", "RM 100", "Multicam"],
    source_note: "Arsip produksi visual Google Drive & pengalaman My Studio Indrapura",
    body: [
      "Menyunting video berdurasi panjang untuk dokumentasi pernikahan dan mengemas video vertikal 35–40 detik untuk kebutuhan promosi gerai membutuhkan disiplin yang berbeda, tetapi keduanya bertumpu pada kepekaan ritme.",
      "Saat bekerja di My Studio Indrapura pada Juni hingga Oktober 2024, setiap hari kerja saya menghadapi antrean rekaman pernikahan yang harus disunting rapi di Filmora—lengkap dengan sinkronisasi audio dan penyesuaian warna—di samping melayani pemotretan pasfoto menggunakan Sony A6500.",
      "Pengalaman tersebut berlanjut pada penggarapan konten komersial seperti seri A Day Behind the Cashier di Kopi TM 100 serta interaksi koordinator lapangan di RM 100 Seafood Resto. Pada format pendek 35–40 detik, tantangan utamanya adalah memilih momen paling hidup dari dua sudut kamera.",
      "Rekaman dari kamera bermikrofon memberi kejelasan suara percakapan yang otentik, sedangkan kamera sudut kedua menutup celah visual dan menjaga dinamika gambar. Bagian percakapan yang kurang jernih harus berani dipangkas agar keseluruhan video terasa ringkas.",
      "Ditambah pengalaman magang di Sekretariat DPRD Kabupaten Batubara serta pembuatan logo dan bumper visual untuk Mr. Bob, saya belajar bahwa konsistensi arsip footage dan ketepatan briefing selalu menentukan mutu hasil akhir."
    ]
  },
  {
    slug: "naskah-siaran-foxsa-news",
    category: "Produksi Visual",
    featured: false,
    published_year: "2026",
    read_time: "5 menit baca",
    title: "Menulis Naskah Siaran di FoxSA News: Menjaga Alur Wawancara Tetap Jelas",
    excerpt:
      "Menyusun full broadcast script untuk program Fit to Fire Fighter melatih cara membagi segmen teknis—mulai dari pemadaman hingga hazmat—agar tetap enak diikuti penonton.",
    tags: ["Broadcast Script", "FoxSA News", "Komunikasi Massa", "Penulisan"],
    source_note: "Naskah siaran FoxSA News — Fit to Fire Fighter",
    body: [
      "Menulis untuk dibaca dalam hati berbeda jauh dengan menulis naskah yang akan diucapkan pembawa acara di depan kamera. Kalimat yang terlalu panjang membuat pewawancara kehilangan napas, sedangkan pertanyaan yang melompat-lompat membingungkan audiens.",
      "Ketika menyusun naskah siaran penuh FoxSA News bertajuk Fit to Fire Fighter untuk diskusi bersama Los Santos Fire Department, tantangan utamanya adalah menata topik yang padat menjadi rangkaian segmen yang runtut.",
      "Alurnya dipecah bertahap: mulai dari pengenalan peran inti lembaga, kesiapan mental dan fisik personel, strategi pemadaman api dan layanan medis darurat (EMS), hingga operasi penyelamatan teknis dan penanganan bahan berbahaya (hazmat).",
      "Setiap transisi antarsegmen diberi jembatan pertanyaan tindak lanjut yang singkat agar percakapan terasa mengalir wajar, bukan seperti daftar soal ujian. Dari proses itu saya semakin yakin bahwa penulisan naskah siaran yang baik selalu mendahulukan telinga dan daya tangkap penonton."
    ]
  },
  {
    slug: "bookstagram-matcha-dan-membaca-pelan",
    category: "Buku & Literasi",
    featured: false,
    published_year: "2025",
    read_time: "4 menit baca",
    title: "Bookstagram, Matcha, dan Seni Membaca Tanpa Tergesa",
    excerpt:
      "Mengapa mencatat kutipan buku di tengah malam dan berbagi ulasan singkat di ruang digital membantu membangun kebiasaan berpikir lebih jernih.",
    tags: ["Bookstagram", "Membaca", "Catatan Literasi", "Esai Ringan"],
    source_note: "Catatan ruang baca & proyek konten bookstagram",
    body: [
      "Di tengah linimasa media sosial yang penuh potongan video lima belas detik, membaca buku setebal empat ratus halaman sering dianggap kemewahan yang lambat. Justru di situlah letak daya tariknya.",
      "Kebiasaan mendokumentasikan bacaan lewat konsep bookstagram bermula dari hal sederhana: ingin mengingat kesan yang tertinggal setelah menutup halaman terakhir. Secangkir matcha hangat di samping buku, catatan pinggir yang ditulis pensil, dan satu paragraf refleksi cukup untuk mengikat ingatan itu.",
      "Ketika kita menulis ulang gagasan penulis lain dengan bahasa sendiri, proses membaca berubah menjadi dialog dua arah. Kita tidak sekadar menyetujui isi buku, tetapi mengujinya dengan pengalaman hidup sehari-hari.",
      "Bagi saya, literasi bukan tentang seberapa banyak judul yang dipamerkan dalam daftar tahunan. Literasi diukur dari seberapa dalam satu buku mengubah cara kita memandang orang lain."
    ]
  },
  {
    slug: "catatan-teknis-merancang-antarmuka-web",
    category: "Teknologi & Web",
    featured: false,
    published_year: "2025",
    read_time: "6 menit baca",
    title: "Dari MLBB Pro Manager ke Dashboard Gudang: Pelajaran Merancang Antarmuka Web",
    excerpt:
      "Membangun game simulasi manajemen berbasis browser dan prototipe dashboard stok logistik mengajarkan bahwa desain antarmuka terbaik adalah yang mudah dipahami dalam sekali pandang.",
    tags: ["Web Development", "Next.js", "Supabase", "UI Design"],
    source_note: "Eksperimen proyek web pribadi & aplikasi manajemen data",
    body: [
      "Setiap proyek web memiliki tuntutan antarmuka yang berbeda, namun ukuran keberhasilannya selalu sama: seberapa cepat pengguna memahami apa yang harus dilakukan tanpa membaca buku panduan.",
      "Saat mengerjakan proyek eksperimen game browser seperti ESports Club: MLBB Pro Manager dengan HTML, CSS, dan JavaScript murni, tantangannya terletak pada penyajian statistik tim, strategi pertandingan, dan manajemen ekonomi dalam satu layar yang tetap lapang.",
      "Tantangan serupa muncul ketika menyusun prototipe aplikasi web manajemen inventaris gudang seperti BULOG Stock Manager berbasis React dan Next.js, serta aplikasi perpustakaan sekolah yang responsif sewaktu masih duduk di bangku SMK.",
      "Kini situs blog pribadi ini pun saya hubungkan dengan basis data PostgreSQL melalui Supabase dan lingkungan serverless Vercel agar pengelolaan artikel, portofolio, serta sinkronisasi Substack berjalan dinamis.",
      "Baik membangun situs profil institusi seperti perisainusantara.com maupun merancang blog ini, prinsip yang saya pegang tetap sederhana: singkirkan elemen hiasan yang tidak perlu agar konten utama dapat bernapas."
    ]
  }
];

const PROJECTS = [
  {
    slug: "kopi-tm-100-rm-100-video",
    name: "Kopi TM 100 & RM 100 Seafood Resto",
    category: "Produksi Video Komersial · Multicam",
    description:
      "Perancangan alur dan penyuntingan konten video vertikal 35–40 detik ('A Day Behind the Cashier at Kopi TM 100' dan 'Korlap on mic at RM 100') memadukan footage mikrofon utama serta sudut kamera kedua.",
    tags: ["Video Editing", "Multicam", "Short-Form"],
    source_label: "Portofolio Drive",
    featured: true,
    sort_order: 1
  },
  {
    slug: "mr-bob-logo-bumper-video",
    name: "Mr. Bob — Logo, Bumper & Mini Project Video",
    category: "Identitas Visual & Motion Graphics",
    description:
      "Perancangan logo 'MR BOB Super Seru', bumper penutup format potret, serta penyuntingan video mini project lengkap dengan perekaman dubbing dan penataan footage.",
    tags: ["Branding", "Motion Bumper", "After Effects"],
    source_label: "Portofolio Drive",
    featured: true,
    sort_order: 2
  },
  {
    slug: "foxsa-news-broadcast-script",
    name: "FoxSA News — Fit to Fire Fighter",
    category: "Naskah Siaran (Broadcast Script)",
    description:
      "Penulisan naskah wawancara siaran multi-segmen mengenai operasi pemadaman, layanan medis darurat (EMS), penyelamatan teknis, dan penanganan hazmat.",
    tags: ["Scriptwriting", "Broadcast", "Komunikasi"],
    source_label: "Portofolio Drive",
    featured: true,
    sort_order: 3
  },
  {
    slug: "bulog-stock-manager",
    name: "BULOG Stock Manager",
    category: "Aplikasi Web · React & Next.js",
    description:
      "Prototipe dashboard inventaris dan pemantauan stok gudang dengan penyajian metrik operasional yang bersih, cepat dibaca, dan terstruktur.",
    tags: ["Next.js", "React", "UI Data"],
    source_label: "Proyek Web",
    featured: false,
    sort_order: 4
  },
  {
    slug: "esports-club-mlbb-pro-manager",
    name: "ESports Club: MLBB Pro Manager",
    category: "Game Simulasi Web · HTML/CSS/JS",
    description:
      "Eksperimen game simulasi manajer klub esports berbasis browser dengan logika manajemen roster, anggaran klub, dan simulasi pertandingan.",
    tags: ["JavaScript", "Game UI", "State Logic"],
    source_label: "Proyek Web",
    featured: false,
    sort_order: 5
  },
  {
    slug: "perisainusantara-dan-web-perpustakaan",
    name: "perisainusantara.com & Web Perpustakaan",
    category: "Web Institusi & LKS Web Technology",
    description:
      "Pengelolaan dan pengembangan antarmuka situs web informasi publik perisainusantara.com serta aplikasi perpustakaan sekolah responsif melalui jaringan Wi-Fi lokal.",
    tags: ["Web Admin", "SQL", "Responsive UI"],
    source_label: "SMKN 1 Air Putih",
    featured: false,
    sort_order: 6
  },
  {
    slug: "video-profil-smkn1-air-putih",
    name: "Video Profil SMKN 1 Air Putih & RPL 2024",
    category: "Motion & Video · After Effects",
    description:
      "Produksi konsep hingga finalisasi video pengenalan resmi sekolah dan dokumentasi jurusan Rekayasa Perangkat Lunak 2024 dengan After Effects dan Premiere Pro.",
    tags: ["After Effects", "Premiere Pro", "Storytelling"],
    source_label: "Publikasi Sekolah",
    featured: false,
    sort_order: 7
  }
];

const EXPERIENCES = [
  {
    slug: "ut-ilmu-komunikasi",
    period: "2024 — Sekarang",
    role: "Mahasiswa S1 Ilmu Komunikasi",
    org: "Universitas Terbuka (FHISIP · UPBJJ-UT Medan)",
    detail:
      "Mendalami teori komunikasi massa, public speaking (FSIK4103), penulisan naskah siaran, dan kajian literasi.",
    sort_order: 1
  },
  {
    slug: "my-studio-indrapura",
    period: "Jun — Okt 2024",
    role: "Video Editor & Fotografer Studio",
    org: "My Studio Indrapura, Batubara",
    detail:
      "Menyunting 3–4 video pernikahan berdurasi panjang per hari di Filmora serta menangani pemotretan pasfoto Sony A6500 dan Photoshop.",
    sort_order: 2
  },
  {
    slug: "bnsp-junior-web-dev",
    period: "22 April 2024",
    role: "Tersertifikasi Junior Web Developer",
    org: "BNSP · LSP Teknologi Informasi Nusantara",
    detail:
      "Lulus uji kompetensi nasional bidang Pengembangan Perangkat Lunak dan Pemrograman mencakup 6 unit kompetensi pemrograman terstruktur.",
    sort_order: 3
  },
  {
    slug: "smkn1-air-putih-dan-dprd",
    period: "2021 — 2024",
    role: "Rekayasa Perangkat Lunak (RPL)",
    org: "SMK Negeri 1 Air Putih · PKL DPRD Batubara",
    detail:
      "Mewakili sekolah di LKS Web Design tingkat provinsi, mengelola Dapodik SDN 29 Sukaraja (2022–2024), dan menyelesaikan magang DPRD Batubara dengan predikat Istimewa (nilai 95).",
    sort_order: 4
  }
];

module.exports = {
  PROFILE,
  CATEGORIES,
  POSTS,
  PROJECTS,
  EXPERIENCES
};
