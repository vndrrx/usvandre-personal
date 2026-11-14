/**
 * GET /api/portfolio — Mengambil profil, proyek, dan rekam jejak dari Supabase PostgreSQL
 * (dengan fallback terkurasi bila env database belum dikonfigurasi).
 */
const db = require("../lib/db");
const { PROFILE, PROJECTS, EXPERIENCES } = require("../lib/seed-data");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (db.hasDatabase()) {
    try {
      const [projRes, expRes] = await Promise.all([
        db.query(
          `SELECT slug, name, category, description, tags, source_label, featured
           FROM public.projects
           ORDER BY sort_order ASC, created_at DESC`
        ),
        db.query(
          `SELECT slug, period, role, org, detail
           FROM public.experiences
           ORDER BY sort_order ASC`
        )
      ]);

      if (projRes && expRes && (projRes.rows.length > 0 || expRes.rows.length > 0)) {
        return res.status(200).json({
          source: "supabase-sql",
          dbConnected: true,
          profile: PROFILE,
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
    projects: PROJECTS,
    experiences: EXPERIENCES
  });
};
