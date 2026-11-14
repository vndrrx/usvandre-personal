# Usvandre Nur — Personal Blog & Portfolio

Website blog personal dan portofolio **Usvandre Nur**, siap terhubung ke **GitHub**, **Vercel**, **Supabase PostgreSQL**, **Substack** (`@vandroidd`), dan **Threads** (`@usvandrnr`).

## Fitur Utama
- **Desain Editorial Minimalis**: Hero ilustratif bernuansa lembut dengan gradien putih, navigasi transparan ke kaca halus, serta *wordmark* `usvandre.` yang bersih.
- **Database SQL (Supabase PostgreSQL)**:
  - Skema tabel di [supabase/schema.sql](supabase/schema.sql): `posts`, `projects`, `experiences`, `substack_posts`, dan `contact_messages`.
  - API Vercel Serverless Functions di folder `api/` (`/api/posts`, `/api/portfolio`, `/api/substack`, `/api/contact`).
  - Dilengkapi *fallback* data terkurasi apabila *environment variable* database belum dipasang.
- **Bagian Khusus Substack (Cuplikan Parsial)**:
  - Menarik *RSS feed* Substack secara otomatis melalui `/api/substack`, memangkas isi artikel menjadi **cuplikan sebagian** (~210 karakter), menyimpannya ke tabel `substack_posts`, dan menyediakan tautan lanjut membaca ke Substack penuh.
- **Portofolio Terkurasi**:
  - Menampilkan proyek web, *dashboard* data, naskah siaran (*FoxSA News*), identitas visual (*Mr. Bob*), serta produksi video pendek (*Kopi TM 100*, *RM 100*, dan studio).

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
