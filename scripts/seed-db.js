/**
 * Skrip seed Supabase PostgreSQL (`npm run db:seed`).
 * Menerapkan supabase/schema.sql lalu mengisi tabel posts, projects, dan experiences.
 */
const fs = require("fs");
const path = require("path");
const db = require("../lib/db");
const { POSTS, PROJECTS, EXPERIENCES } = require("../lib/seed-data");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    val = val.replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

async function run() {
  const root = path.resolve(__dirname, "..");
  loadEnvFile(path.join(root, ".env"));
  loadEnvFile(path.join(root, ".env.local"));

  if (!db.hasDatabase()) {
    console.error("ERROR: POSTGRES_URL atau DATABASE_URL belum diset di .env / .env.local.");
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(path.join(root, "supabase", "schema.sql"), "utf8");
  await db.query(schemaSql);

  for (const p of POSTS) {
    await db.query(
      `INSERT INTO public.posts (slug, category, title, excerpt, body, tags, source_note, read_time, published_year, featured, published)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::text[], $7, $8, $9, $10, TRUE)
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
         updated_at = NOW()`,
      [
        p.slug,
        p.category,
        p.title,
        p.excerpt,
        JSON.stringify(p.body),
        p.tags,
        p.source_note,
        p.read_time,
        p.published_year,
        Boolean(p.featured)
      ]
    );
  }

  for (const pr of PROJECTS) {
    await db.query(
      `INSERT INTO public.projects (slug, name, category, description, tags, source_label, featured, sort_order)
       VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         tags = EXCLUDED.tags,
         source_label = EXCLUDED.source_label,
         featured = EXCLUDED.featured,
         sort_order = EXCLUDED.sort_order`,
      [pr.slug, pr.name, pr.category, pr.description, pr.tags, pr.source_label, Boolean(pr.featured), pr.sort_order]
    );
  }

  for (const ex of EXPERIENCES) {
    await db.query(
      `INSERT INTO public.experiences (slug, period, role, org, detail, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE SET
         period = EXCLUDED.period,
         role = EXCLUDED.role,
         org = EXCLUDED.org,
         detail = EXCLUDED.detail,
         sort_order = EXCLUDED.sort_order`,
      [ex.slug, ex.period, ex.role, ex.org, ex.detail, ex.sort_order]
    );
  }

  const counts = await db.query(
    `SELECT
       (SELECT COUNT(*) FROM public.posts) AS posts,
       (SELECT COUNT(*) FROM public.projects) AS projects,
       (SELECT COUNT(*) FROM public.experiences) AS experiences`
  );
  console.log("Seed Supabase SQL selesai:", counts.rows[0]);
  await db.getPool().end();
}

run().catch((err) => {
  console.error("Seed gagal:", err);
  process.exit(1);
});
