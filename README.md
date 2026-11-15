# Usvandre Nur — Personal Blog & Portfolio

Website blog personal dan portofolio **Usvandre Nur**, siap terhubung ke **GitHub**, **Vercel**, **Supabase PostgreSQL**, **Substack** (`@vandroidd`), dan **Threads** (`@usvandrnr`).

## Fitur Utama
- **Desain Editorial Minimalis**: Hero ilustratif bernuansa lembut dengan gradien putih, foto profil monokrom hitam-putih, navigasi kaca halus, serta *wordmark* `Usvandre Nur` yang bersih.
- **Database SQL (Supabase PostgreSQL)**:
  - Skema tabel dan seed awal di [supabase/schema.sql](supabase/schema.sql): `posts`, `projects`, `experiences`, `substack_posts`, `social_posts`, dan `contact_messages`.
  - Berkas statis disajikan dari folder `public/` dengan API Vercel Serverless Functions di folder `api/` (`/api/posts`, `/api/portfolio`, `/api/substack`, `/api/feeds`, `/api/contact`).
  - Dilengkapi *fallback* data terkurasi apabila *environment variable* database belum dipasang.
- **Kanal Terpadu Substack & Threads (Cuplikan Parsial)**:
  - Menggabungkan *RSS feed* Substack (`@vandroidd`) dan pembaruan Threads (`@usvandrnr` via `THREADS_ACCESS_TOKEN` opsional) melalui `/api/feeds`, memangkas isi tulisan menjadi cuplikan sebagian (~210 karakter), menyimpannya ke tabel `social_posts`, serta menyediakan tautan lanjut ke kanal asli di bagian bawah halaman.
- **Portofolio & Galeri Logo Terkurasi**:
  - Menampilkan 5 karya identitas visual (*Infinite Esport*, *Infinite Emblem*, *Dyandra Academy*, *Mr. BOB Super Seru!*, *Aky Hex Crest*), 8 proyek web/produksi konten dalam *grid* seimbang, serta rekam jejak karier dan pendidikan.

## Menjalankan Secara Lokal
```bash
npm install
npm start
```
Buka `http://127.0.0.1:4173`.

## Menghubungkan ke Supabase & Vercel (via GitHub)
1. Buat proyek baru di [Supabase](https://supabase.com) dan buka **SQL Editor**.
2. Jalankan isi [supabase/schema.sql](supabase/schema.sql), atau salin `DATABASE_URL` / `POSTGRES_URL` (Transaction/Session Pooler) ke `.env.local` lalu jalankan:
   ```bash
   npm run db:seed
   ```
3. *Push* repositori ini ke GitHub, lalu *import* ke [Vercel](https://vercel.com).
4. Tambahkan integrasi **Supabase** di proyek Vercel (atau isi *environment variable* `DATABASE_URL` / `POSTGRES_URL`).
5. *(Opsional)* Setelah Anda membuat publikasi di Substack dan menerbitkan tulisan pertama, jika alamat RSS publikasinya bukan `https://vandroidd.substack.com/feed`, isi `SUBSTACK_FEED_URL=https://<nama-publikasi>.substack.com/feed` pada Environment Variables Vercel.
