-- Skema PostgreSQL untuk Blog Personal & Portofolio Usvandre Nur (Supabase + Vercel)
-- Jalankan berkas ini di Supabase SQL Editor, atau melalui `npm run db:seed`.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Artikel & Esai Blog
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  source_note TEXT,
  read_time TEXT NOT NULL DEFAULT '5 menit baca',
  published_year TEXT NOT NULL DEFAULT '2026',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Portofolio Proyek (Web, Logo, Produksi Video, Naskah Siaran)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  source_label TEXT NOT NULL DEFAULT 'Arsip Karya',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Rekam Jejak Pendidikan, Sertifikasi & Pengalaman Kerja
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  period TEXT NOT NULL,
  role TEXT NOT NULL,
  org TEXT NOT NULL,
  detail TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Cache Artikel Substack (parsial)
CREATE TABLE IF NOT EXISTS public.substack_posts (
  guid TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Feed Terpadu Substack & Threads (cuplikan parsial + tautan keluar)
CREATE TABLE IF NOT EXISTS public.social_posts (
  external_id TEXT PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('substack', 'threads')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  link TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Pesan Korespondensi Pengunjung
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Galeri Kenangan Foto Pribadi
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  album TEXT NOT NULL DEFAULT 'Keseharian',
  taken_date TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  image_data TEXT NOT NULL,
  aspect_hint TEXT NOT NULL DEFAULT 'auto',
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks untuk pencarian & pengurutan cepat
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON public.projects (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_substack_pub ON public.substack_posts (published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_social_pub ON public.social_posts (published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_memories_album ON public.memories (album, created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substack_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Public read published posts') THEN
    CREATE POLICY "Public read published posts" ON public.posts FOR SELECT USING (published = TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Public read projects') THEN
    CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'experiences' AND policyname = 'Public read experiences') THEN
    CREATE POLICY "Public read experiences" ON public.experiences FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'substack_posts' AND policyname = 'Public read substack cache') THEN
    CREATE POLICY "Public read substack cache" ON public.substack_posts FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_posts' AND policyname = 'Public read social posts') THEN
    CREATE POLICY "Public read social posts" ON public.social_posts FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Public insert contact messages') THEN
    CREATE POLICY "Public insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'memories' AND policyname = 'Public read non-private memories') THEN
    CREATE POLICY "Public read non-private memories" ON public.memories FOR SELECT USING (is_private = FALSE);
  END IF;
END
$$;

-- Seed awal terkurasi (idempoten, aman dijalankan ulang di Supabase SQL Editor)
DELETE FROM public.projects WHERE slug IN ('kopi-tm-100-rm-100-video', 'mr-bob-logo-bumper-video', 'infinite-esport-dyandra-branding');

INSERT INTO public.posts (slug, category, title, excerpt, body, tags, source_note, read_time, published_year, featured, published)
VALUES ('laut-bercerita-sejarah-1998', 'Esai & Opini', 'Laut Bercerita: Mengapa Generasi Muda Tidak Boleh Melupakan Sejarah 1998?', 'Diangkat dari naskah Public Speaking FSIK4103 di Universitas Terbuka: membaca ulang kisah sejarah 1998 sebagai pengingat bahwa kebebasan bersuara lahir dari pengorbanan yang nyata.', '["Ketika menikmati kebebasan berpendapat hari ini, kita jarang bertanya berapa harga yang pernah dibayar untuk mewujudkannya. Novel Laut Bercerita karya Leila S. Chudori membuka pintu ingatan menuju tahun 1998—masa ketika sejumlah aktivis mahasiswa dihilangkan paksa hanya karena menuntut keadilan.","Tokoh Biru Laut dan rekan-rekannya dalam kisah itu memang lahir dari imajinasi sastra, tetapi luka sosial yang melatarbelakanginya berakar pada fakta sejarah. Laporan Komnas HAM serta Komnas Perempuan mencatat bahwa hingga kini masih ada korban penghilangan paksa 1997–1998 yang belum kembali kepada keluarganya.","Sebagai mahasiswa Ilmu Komunikasi, saya memandang karya tersebut bukan sekadar bacaan sastra sejarah. Ia bekerja sebagai medium komunikasi publik yang menjembatani arsip sejarah yang dingin dengan empati generasi muda.","Ada tiga alasan utama mengapa generasi hari ini perlu merawat ingatan tersebut. Pertama, kebebasan berekspresi bukan hadiah yang datang tiba-tiba, melainkan hak yang diperjuangkan dengan nyawa dan kehilangan. Kedua, tanpa kesadaran sejarah, kita rentan mengulangi kesalahan serupa dalam rupa yang berbeda.","Ketiga, empati warga negara tumbuh saat kita berani menengok sisi gelap masa lalu bangsa, lalu menjadikannya tolok ukur etika bermasyarakat. Merawat ingatan bukan berarti memelihara dendam; merawat ingatan berarti menolak abai agar ruang demokrasi tetap hidup bagi siapa saja."]'::jsonb, ARRAY['Public Speaking', 'Ilmu Komunikasi', 'Sastra Indonesia', '1998']::text[], 'Naskah Pidato FSIK4103 — S1 Ilmu Komunikasi FHISIP Universitas Terbuka', '6 menit baca', '2026', true, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  tags = EXCLUDED.tags,
  source_note = EXCLUDED.source_note,
  read_time = EXCLUDED.read_time,
  published_year = EXCLUDED.published_year,
  featured = EXCLUDED.featured,
  updated_at = NOW();

INSERT INTO public.posts (slug, category, title, excerpt, body, tags, source_note, read_time, published_year, featured, published)
VALUES ('dari-rpl-ke-ilmu-komunikasi', 'Esai & Opini', 'Dari Rekayasa Perangkat Lunak ke Ilmu Komunikasi: Menggabungkan Logika dan Narasi', 'Lulus dari jurusan RPL SMKN 1 Air Putih dan mengantongi sertifikat BNSP Junior Web Developer menjadi pijakan untuk memahami cara manusia bertukar gagasan.', '["Banyak orang mengira berpindah jalur dari Rekayasa Perangkat Lunak ke Ilmu Komunikasi berarti meninggalkan dunia teknis. Padahal, keduanya sama-sama mengajarkan satu hal mendasar: merancang struktur agar pesan dapat diterima tanpa gangguan.","Sewaktu belajar di SMKN 1 Air Putih pada periode 2021–2024, saya terbiasa menyusun basis data, menuliskan kode antarmuka web, hingga mengikuti LKS Web Design tingkat provinsi dan meraih sertifikasi kompetensi Junior Web Developer dari BNSP pada April 2024.","Di sela jam praktik laboratorium, saya banyak menghabiskan waktu menyunting video dengan Adobe After Effects dan Premiere Pro. Kebiasaan menyusun potongan gambar, ritme audio, dan tipografi membuat saya sadar bahwa teknologi membutuhkan narasi agar terasa hidup.","Pengalaman membuat video pengenalan sekolah serta bekerja sebagai editor video di studio Indrapura dan produksi konten komersial mempertajam kesadaran bahwa perangkat hanyalah wadah. Kekuatan sejati sebuah karya tetap bergantung pada kejelasan pesan yang dibawanya.","Pilihan kuliah di S1 Ilmu Komunikasi Universitas Terbuka menjadi titik temu alami. Ilmu kode melatih logika terstruktur, sedangkan ilmu komunikasi mengasah kepekaan terhadap audiens dan makna."]'::jsonb, ARRAY['Refleksi', 'Ilmu Komunikasi', 'RPL', 'Karier']::text[], 'Catatan perjalanan studi dan minat lintas disiplin', '5 menit baca', '2025', false, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  tags = EXCLUDED.tags,
  source_note = EXCLUDED.source_note,
  read_time = EXCLUDED.read_time,
  published_year = EXCLUDED.published_year,
  featured = EXCLUDED.featured,
  updated_at = NOW();

INSERT INTO public.posts (slug, category, title, excerpt, body, tags, source_note, read_time, published_year, featured, published)
VALUES ('ritme-video-komersial-dan-studio', 'Produksi Visual', 'Menjaga Ritme di Meja Sunting: Pengalaman Studio Indrapura dan Produksi Video Profil', 'Dari menyunting tiga sampai empat video pernikahan per hari di studio hingga merancang video profil sekolah, ketelitian ritme audio dan visual menentukan kenyamanan penonton.', '["Menyunting video dokumentasi berdurasi panjang dan mengemas video pengenalan institusi dalam format ringkas membutuhkan disiplin berbeda, tetapi keduanya bertumpu pada kepekaan ritme.","Saat bekerja di My Studio Indrapura pada Juni hingga Oktober 2024, setiap hari kerja saya menghadapi antrean rekaman pernikahan yang harus disunting rapi di Filmora—lengkap dengan sinkronisasi audio dan penyesuaian warna—di samping melayani pemotretan pasfoto menggunakan Sony A6500.","Pengalaman serupa juga menguji ketelitian saat memproduksi video profil SMKN 1 Air Putih serta dokumentasi jurusan Rekayasa Perangkat Lunak 2024 menggunakan Adobe After Effects dan Premiere Pro.","Pada video profil, setiap potongan gambar harus sejalan dengan narasi pembuka dan tipografi penjelas agar informasi tersampaikan tanpa terasa terburu-buru.","Ditambah pengalaman magang di Sekretariat DPRD Kabupaten Batubara serta perancangan identitas visual Infinite Esport, saya belajar bahwa konsistensi visual dan kejelasan struktur selalu menentukan mutu hasil akhir."]'::jsonb, ARRAY['Video Editing', 'After Effects', 'Studio', 'Produksi Visual']::text[], 'Arsip produksi visual pribadi & pengalaman My Studio Indrapura', '5 menit baca', '2025', true, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  tags = EXCLUDED.tags,
  source_note = EXCLUDED.source_note,
  read_time = EXCLUDED.read_time,
  published_year = EXCLUDED.published_year,
  featured = EXCLUDED.featured,
  updated_at = NOW();

INSERT INTO public.posts (slug, category, title, excerpt, body, tags, source_note, read_time, published_year, featured, published)
VALUES ('naskah-siaran-foxsa-news', 'Produksi Visual', 'Menulis Naskah Siaran di FoxSA News: Menjaga Alur Wawancara Tetap Jelas', 'Menyusun full broadcast script untuk program Fit to Fire Fighter melatih cara membagi segmen teknis—mulai dari pemadaman hingga hazmat—agar tetap enak diikuti penonton.', '["Menulis untuk dibaca dalam hati berbeda jauh dengan menulis naskah yang akan diucapkan pembawa acara di depan kamera. Kalimat yang terlalu panjang membuat pewawancara kehilangan napas, sedangkan pertanyaan yang melompat-lompat membingungkan audiens.","Ketika menyusun naskah siaran penuh FoxSA News bertajuk Fit to Fire Fighter untuk diskusi bersama Los Santos Fire Department, tantangan utamanya adalah menata topik yang padat menjadi rangkaian segmen yang runtut.","Alurnya dipecah bertahap: mulai dari pengenalan peran inti lembaga, kesiapan mental dan fisik personel, strategi pemadaman api dan layanan medis darurat (EMS), hingga operasi penyelamatan teknis dan penanganan bahan berbahaya (hazmat).","Setiap transisi antarsegmen diberi jembatan pertanyaan tindak lanjut yang singkat agar percakapan terasa mengalir wajar, bukan seperti daftar soal ujian. Dari proses itu saya semakin yakin bahwa penulisan naskah siaran yang baik selalu mendahulukan telinga dan daya tangkap penonton."]'::jsonb, ARRAY['Broadcast Script', 'FoxSA News', 'Komunikasi Massa', 'Penulisan']::text[], 'Naskah siaran FoxSA News — Fit to Fire Fighter', '5 menit baca', '2026', false, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  tags = EXCLUDED.tags,
  source_note = EXCLUDED.source_note,
  read_time = EXCLUDED.read_time,
  published_year = EXCLUDED.published_year,
  featured = EXCLUDED.featured,
  updated_at = NOW();

INSERT INTO public.posts (slug, category, title, excerpt, body, tags, source_note, read_time, published_year, featured, published)
VALUES ('bookstagram-matcha-dan-membaca-pelan', 'Buku & Literasi', 'Bookstagram, Matcha, dan Seni Membaca Tanpa Tergesa', 'Mengapa mencatat kutipan buku di tengah malam dan berbagi ulasan singkat di ruang digital membantu membangun kebiasaan berpikir lebih jernih.', '["Di tengah linimasa media sosial yang penuh potongan video lima belas detik, membaca buku setebal empat ratus halaman sering dianggap kemewahan yang lambat. Justru di situlah letak daya tariknya.","Kebiasaan mendokumentasikan bacaan lewat konsep bookstagram bermula dari hal sederhana: ingin mengingat kesan yang tertinggal setelah menutup halaman terakhir. Secangkir matcha hangat di samping buku, catatan pinggir yang ditulis pensil, dan satu paragraf refleksi cukup untuk mengikat ingatan itu.","Ketika kita menulis ulang gagasan penulis lain dengan bahasa sendiri, proses membaca berubah menjadi dialog dua arah. Kita tidak sekadar menyetujui isi buku, tetapi mengujinya dengan pengalaman hidup sehari-hari.","Bagi saya, literasi bukan tentang seberapa banyak judul yang dipamerkan dalam daftar tahunan. Literasi diukur dari seberapa dalam satu buku mengubah cara kita memandang orang lain."]'::jsonb, ARRAY['Bookstagram', 'Membaca', 'Catatan Literasi', 'Esai Ringan']::text[], 'Catatan ruang baca & proyek konten bookstagram', '4 menit baca', '2025', false, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  tags = EXCLUDED.tags,
  source_note = EXCLUDED.source_note,
  read_time = EXCLUDED.read_time,
  published_year = EXCLUDED.published_year,
  featured = EXCLUDED.featured,
  updated_at = NOW();

INSERT INTO public.posts (slug, category, title, excerpt, body, tags, source_note, read_time, published_year, featured, published)
VALUES ('catatan-teknis-merancang-antarmuka-web', 'Teknologi & Web', 'Dari MLBB Pro Manager ke Dashboard Gudang: Pelajaran Merancang Antarmuka Web', 'Membangun game simulasi manajemen berbasis browser dan prototipe dashboard stok logistik mengajarkan bahwa desain antarmuka terbaik adalah yang mudah dipahami dalam sekali pandang.', '["Setiap proyek web memiliki tuntutan antarmuka yang berbeda, namun ukuran keberhasilannya selalu sama: seberapa cepat pengguna memahami apa yang harus dilakukan tanpa membaca buku panduan.","Saat mengerjakan proyek eksperimen game browser seperti ESports Club: MLBB Pro Manager dengan HTML, CSS, dan JavaScript murni, tantangannya terletak pada penyajian statistik tim, strategi pertandingan, dan manajemen ekonomi dalam satu layar yang tetap lapang.","Tantangan serupa muncul ketika menyusun prototipe aplikasi web manajemen inventaris gudang seperti BULOG Stock Manager berbasis React dan Next.js, serta aplikasi perpustakaan sekolah yang responsif sewaktu masih duduk di bangku SMK.","Kini situs blog pribadi ini pun saya hubungkan dengan basis data PostgreSQL melalui Supabase dan lingkungan serverless Vercel agar pengelolaan artikel, portofolio, serta sinkronisasi Substack dan Threads berjalan dinamis.","Baik membangun situs profil institusi seperti perisainusantara.com maupun merancang blog ini, prinsip yang saya pegang tetap sederhana: singkirkan elemen hiasan yang tidak perlu agar konten utama dapat bernapas."]'::jsonb, ARRAY['Web Development', 'Next.js', 'Supabase', 'UI Design']::text[], 'Eksperimen proyek web pribadi & aplikasi manajemen data', '6 menit baca', '2025', false, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  tags = EXCLUDED.tags,
  source_note = EXCLUDED.source_note,
  read_time = EXCLUDED.read_time,
  published_year = EXCLUDED.published_year,
  featured = EXCLUDED.featured,
  updated_at = NOW();

INSERT INTO public.projects (slug, name, category, description, tags, source_label, featured, sort_order)
VALUES ('infinite-esport-branding', 'Infinite Esport — Identitas Visual & Logo', 'Identitas Visual & Logo', 'Perancangan logo utama, wordmark, dan emblem monogram transparan untuk tim Infinite Esport yang tersimpan di folder work out.', ARRAY['Logo Design', 'Brand Identity', 'Vector']::text[], 'Drive · work out', true, 1)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  source_label = EXCLUDED.source_label,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.projects (slug, name, category, description, tags, source_label, featured, sort_order)
VALUES ('foxsa-news-broadcast-script', 'FoxSA News — Fit to Fire Fighter', 'Naskah Siaran (Broadcast Script)', 'Penulisan naskah wawancara siaran multi-segmen mengenai operasi pemadaman, layanan medis darurat (EMS), penyelamatan teknis, dan penanganan hazmat.', ARRAY['Scriptwriting', 'Broadcast', 'Komunikasi']::text[], 'Drive Pribadi', true, 2)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  source_label = EXCLUDED.source_label,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.projects (slug, name, category, description, tags, source_label, featured, sort_order)
VALUES ('video-profil-smkn1-air-putih', 'Video Profil SMKN 1 Air Putih & RPL 2024', 'Motion & Video · After Effects', 'Produksi konsep hingga finalisasi video pengenalan resmi sekolah dan dokumentasi jurusan Rekayasa Perangkat Lunak 2024 dengan After Effects dan Premiere Pro.', ARRAY['After Effects', 'Premiere Pro', 'Storytelling']::text[], 'Publikasi Sekolah', true, 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  source_label = EXCLUDED.source_label,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.projects (slug, name, category, description, tags, source_label, featured, sort_order)
VALUES ('bulog-stock-manager', 'BULOG Stock Manager', 'Aplikasi Web · React & Next.js', 'Prototipe dashboard inventaris dan pemantauan stok gudang dengan penyajian metrik operasional yang bersih, cepat dibaca, dan terstruktur.', ARRAY['Next.js', 'React', 'UI Data']::text[], 'Proyek Web', false, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  source_label = EXCLUDED.source_label,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.projects (slug, name, category, description, tags, source_label, featured, sort_order)
VALUES ('esports-club-mlbb-pro-manager', 'ESports Club: MLBB Pro Manager', 'Game Simulasi Web · HTML/CSS/JS', 'Eksperimen game simulasi manajer klub esports berbasis browser dengan logika manajemen roster, anggaran klub, dan simulasi pertandingan.', ARRAY['JavaScript', 'Game UI', 'State Logic']::text[], 'Proyek Web', false, 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  source_label = EXCLUDED.source_label,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.projects (slug, name, category, description, tags, source_label, featured, sort_order)
VALUES ('perisainusantara-dan-web-perpustakaan', 'perisainusantara.com & Web Perpustakaan', 'Web Institusi & LKS Web Technology', 'Pengelolaan dan pengembangan antarmuka situs web informasi publik perisainusantara.com serta aplikasi perpustakaan sekolah responsif melalui jaringan Wi-Fi lokal.', ARRAY['Web Admin', 'SQL', 'Responsive UI']::text[], 'SMKN 1 Air Putih', false, 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  source_label = EXCLUDED.source_label,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.experiences (slug, period, role, org, detail, sort_order)
VALUES ('ut-ilmu-komunikasi', '2024 — Sekarang', 'Mahasiswa S1 Ilmu Komunikasi', 'Universitas Terbuka (FHISIP · UPBJJ-UT Medan)', 'Mendalami teori komunikasi massa, public speaking (FSIK4103), penulisan naskah siaran, dan kajian literasi.', 1)
ON CONFLICT (slug) DO UPDATE SET
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  org = EXCLUDED.org,
  detail = EXCLUDED.detail,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.experiences (slug, period, role, org, detail, sort_order)
VALUES ('my-studio-indrapura', 'Jun — Okt 2024', 'Video Editor & Fotografer Studio', 'My Studio Indrapura, Batubara', 'Menyunting 3–4 video pernikahan berdurasi panjang per hari di Filmora serta menangani pemotretan pasfoto Sony A6500 dan Photoshop.', 2)
ON CONFLICT (slug) DO UPDATE SET
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  org = EXCLUDED.org,
  detail = EXCLUDED.detail,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.experiences (slug, period, role, org, detail, sort_order)
VALUES ('bnsp-junior-web-dev', '22 April 2024', 'Tersertifikasi Junior Web Developer', 'BNSP · LSP Teknologi Informasi Nusantara', 'Lulus uji kompetensi nasional bidang Pengembangan Perangkat Lunak dan Pemrograman mencakup 6 unit kompetensi pemrograman terstruktur.', 3)
ON CONFLICT (slug) DO UPDATE SET
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  org = EXCLUDED.org,
  detail = EXCLUDED.detail,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.experiences (slug, period, role, org, detail, sort_order)
VALUES ('smkn1-air-putih-dan-dprd', '2021 — 2024', 'Rekayasa Perangkat Lunak (RPL)', 'SMK Negeri 1 Air Putih · PKL DPRD Batubara', 'Mewakili sekolah di LKS Web Design tingkat provinsi, mengelola Dapodik SDN 29 Sukaraja (2022–2024), dan menyelesaikan magang DPRD Batubara dengan predikat Istimewa (nilai 95).', 4)
ON CONFLICT (slug) DO UPDATE SET
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  org = EXCLUDED.org,
  detail = EXCLUDED.detail,
  sort_order = EXCLUDED.sort_order;
