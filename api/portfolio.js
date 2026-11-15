/**
 * GET /api/portfolio — Mengambil profil, galeri logo, proyek, dan rekam jejak dari Supabase PostgreSQL
 * (dengan fallback terkurasi bila env database belum dikonfigurasi).
 */
const db = require("../lib/db");
const { PROFILE, LOGOS, PROJECTS, EXPERIENCES } = require("../lib/seed-data");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (db.hasDatabase()) {
    try {
      let [projRes, expRes] = await Promise.all([
        db.query(
          `SELECT slug, name, category, description, tags, source_label, featured, sort_order
           FROM public.projects
           ORDER BY sort_order ASC, created_at DESC`
        ),
        db.query(
          `SELECT slug, period, role, org, detail
           FROM public.experiences
           ORDER BY sort_order ASC`
        )
      ]);

      if (projRes && expRes) {
        const rows = projRes.rows || [];
        const hasDprd = rows.some((r) => r.slug === "dprd-batubara-web");
        const hasBulog = rows.some((r) => r.slug === "bulog-stock-manager");
        const infRow = rows.find((r) => r.slug === "infinite-esport-branding");
        const mlbbRow = rows.find((r) => r.slug === "esports-club-mlbb-pro-manager");
        const needsProjectSync =
          !hasDprd ||
          hasBulog ||
          !infRow ||
          !infRow.featured ||
          Number(infRow.sort_order) !== 3 ||
          infRow.source_label === "Drive · work out" ||
          infRow.source_label === "vandroidd Studio" ||
          (mlbbRow && mlbbRow.featured);

        if (needsProjectSync) {
          await db.query(`DELETE FROM public.projects WHERE slug = 'bulog-stock-manager'`);
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
          projRes = await db.query(
            `SELECT slug, name, category, description, tags, source_label, featured, sort_order
             FROM public.projects
             ORDER BY sort_order ASC, created_at DESC`
          );
        }
      }

      if (projRes && expRes && (projRes.rows.length > 0 || expRes.rows.length > 0)) {
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
        return res.status(200).json({
          source: "supabase-sql",
          dbConnected: true,
          profile: PROFILE,
          logos: LOGOS,
          projects: projRes.rows,
          experiences: expRes.rows
        });
      }
    } catch (err) {
      console.error("[api/portfolio] SQL error:", err.message);
    }
  }

  return res.status(200).json({
    source: "local-seed",
    dbConnected: false,
    profile: PROFILE,
    logos: LOGOS,
    projects: PROJECTS,
    experiences: EXPERIENCES
  });
};
