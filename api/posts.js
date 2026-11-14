/**
 * GET /api/posts — Mengambil daftar tulisan blog dari Supabase PostgreSQL
 * dengan fallback terkurasi apabila env database belum terpasang.
 */
const db = require("../lib/db");
const { CATEGORIES, POSTS } = require("../lib/seed-data");

function filterLocalPosts(posts, category, q) {
  const query = (q || "").trim().toLowerCase();
  return posts.filter((post) => {
    const matchCat = !category || category === "Semua" || post.category === category;
    if (!matchCat) return false;
    if (!query) return true;
    const text = [post.title, post.excerpt, post.category, ...(post.tags || [])]
      .join(" ")
      .toLowerCase();
    return text.includes(query);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const category = typeof req.query?.category === "string" ? req.query.category : "";
  const q = typeof req.query?.q === "string" ? req.query.q : "";

  if (db.hasDatabase()) {
    try {
      const conditions = ["published = TRUE"];
      const params = [];

      if (category && category !== "Semua") {
        params.push(category);
        conditions.push(`category = $${params.length}`);
      }
      if (q && q.trim()) {
        params.push(`%${q.trim()}%`);
        const idx = params.length;
        conditions.push(`(title ILIKE $${idx} OR excerpt ILIKE $${idx} OR category ILIKE $${idx})`);
      }

      const sql = `
        SELECT slug, category, title, excerpt, body, tags, source_note, read_time, published_year, featured
        FROM public.posts
        WHERE ${conditions.join(" AND ")}
        ORDER BY featured DESC, published_year DESC, created_at DESC
      `;
      const result = await db.query(sql, params);
      if (result && result.rows.length > 0) {
        return res.status(200).json({
          source: "supabase-sql",
          dbConnected: true,
          categories: CATEGORIES,
          posts: result.rows
        });
      }
    } catch (err) {
      console.error("[api/posts] SQL error:", err.message);
    }
  }

  return res.status(200).json({
    source: "local-seed",
    dbConnected: false,
    categories: CATEGORIES,
    posts: filterLocalPosts(POSTS, category, q)
  });
};
