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

-- 2. Portofolio Proyek (Web, Produksi Video, Naskah Siaran, Desain)
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

-- 4. Cache Artikel Substack (hanya cuplikan sebagian + tautan keluar ke Substack)
CREATE TABLE IF NOT EXISTS public.substack_posts (
  guid TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Pesan Korespondensi Pengunjung
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks untuk pencarian & pengurutan cepat
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON public.projects (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_substack_pub ON public.substack_posts (published_at DESC NULLS LAST);

-- Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substack_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

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
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Public insert contact messages') THEN
    CREATE POLICY "Public insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);
  END IF;
END
$$;
