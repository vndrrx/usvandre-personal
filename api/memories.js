/**
 * /api/memories — Galeri Kenangan Foto Pribadi (Supabase PostgreSQL).
 * GET: membaca daftar foto (dengan paginasi, filter album, pencarian, & dukungan mode privat pemilik).
 * POST / DELETE: dilindungi header `x-owner-passcode` sesuai env `MEMORIES_PASSCODE`.
 */
const crypto = require("crypto");
const db = require("../lib/db");

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function getConfiguredPasscode() {
  return String(process.env.MEMORIES_PASSCODE || "").trim();
}

function isAuthorizedOwner(req) {
  const configured = getConfiguredPasscode();
  if (!configured) return false;
  const provided = String(req.headers["x-owner-passcode"] || "").trim();
  if (!provided) return false;
  const a = Buffer.from(configured, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isValidImageSource(src) {
  if (typeof src !== "string") return false;
  const trimmed = src.trim();
  if (trimmed.length < 12 || trimmed.length > 3_500_000) return false;
  if (/^https:\/\//i.test(trimmed)) return true;
  if (/^data:image\/(?:webp|jpeg|jpg|png|avif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) return true;
  return false;
}

module.exports = async function handler(req, res) {
  const passcodeConfigured = Boolean(getConfiguredPasscode());
  const unlocked = isAuthorizedOwner(req);

  if (req.method === "GET") {
    const album = typeof req.query?.album === "string" ? req.query.album.trim() : "";
    const q = typeof req.query?.q === "string" ? req.query.q.trim() : "";
    const sort = req.query?.sort === "oldest" ? "ASC" : "DESC";
    const limit = Math.min(48, Math.max(1, Number.parseInt(req.query?.limit, 10) || 24));
    const offset = Math.max(0, Number.parseInt(req.query?.offset, 10) || 0);

    if (!db.hasDatabase()) {
      return res.status(200).json({
        dbConnected: false,
        passcodeConfigured,
        unlocked,
        total: 0,
        hasMore: false,
        albums: ["Keseharian", "Kampus & Studi", "Batubara", "Studio & Kerja", "Perjalanan"],
        items: []
      });
    }

    try {
      const conditions = [];
      const params = [];

      if (!unlocked) {
        conditions.push("is_private = FALSE");
      }
      if (album && album !== "Semua") {
        params.push(album);
        conditions.push(`album = $${params.length}`);
      }
      if (q) {
        params.push(`%${q}%`);
        conditions.push(`(title ILIKE $${params.length} OR caption ILIKE $${params.length} OR location ILIKE $${params.length})`);
      }

      const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const countRes = await db.query(`SELECT COUNT(*)::int AS total FROM public.memories ${whereSql}`, params);
      const total = countRes?.rows?.[0]?.total || 0;

      const listParams = [...params, limit, offset];
      const rowsRes = await db.query(
        `SELECT id, title, caption, album, taken_date, location, image_data, aspect_hint, is_private, created_at
         FROM public.memories
         ${whereSql}
         ORDER BY created_at ${sort}, id DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        listParams
      );

      const albumWhere = unlocked ? "" : "WHERE is_private = FALSE";
      const albumsRes = await db.query(
        `SELECT DISTINCT album FROM public.memories ${albumWhere} ORDER BY album ASC`
      );
      const dbAlbums = (albumsRes?.rows || []).map((r) => r.album).filter(Boolean);
      const defaultAlbums = ["Keseharian", "Kampus & Studi", "Batubara", "Studio & Kerja", "Perjalanan"];
      const mergedAlbums = [...new Set([...defaultAlbums, ...dbAlbums])];

      return res.status(200).json({
        dbConnected: true,
        passcodeConfigured,
        unlocked,
        total,
        hasMore: offset + (rowsRes?.rows?.length || 0) < total,
        albums: mergedAlbums,
        items: rowsRes?.rows || []
      });
    } catch (err) {
      console.error("[api/memories] GET error:", err.message);
      return res.status(500).json({ error: "Gagal memuat arsip foto kenangan." });
    }
  }

  if (req.method === "POST") {
    if (!passcodeConfigured) {
      return res.status(503).json({
        ok: false,
        error: "MEMORIES_PASSCODE belum diset di Environment Variables Vercel."
      });
    }
    if (!unlocked) {
      return res.status(401).json({ ok: false, error: "Sandi pemilik tidak valid." });
    }

    if (req.query?.action === "verify") {
      return res.status(200).json({ ok: true, unlocked: true });
    }

    if (!db.hasDatabase()) {
      return res.status(503).json({ ok: false, error: "Basis data Supabase belum terhubung." });
    }

    const body = parseBody(req);
    const title = String(body.title || "").trim().slice(0, 140) || "Tanpa Judul";
    const caption = String(body.caption || "").trim().slice(0, 600);
    const album = String(body.album || "Keseharian").trim().slice(0, 60) || "Keseharian";
    const takenDate = String(body.taken_date || "").trim().slice(0, 40);
    const location = String(body.location || "").trim().slice(0, 100);
    const aspectHint = ["portrait", "landscape", "square", "auto"].includes(body.aspect_hint)
      ? body.aspect_hint
      : "auto";
    const isPrivate = Boolean(body.is_private);
    const imageData = String(body.image_data || "").trim();

    if (!isValidImageSource(imageData)) {
      return res.status(400).json({
        ok: false,
        error: "Format atau ukuran gambar tidak valid (maksimal ~2.5 MB terkompresi atau tautan HTTPS)."
      });
    }

    try {
      const inserted = await db.query(
        `INSERT INTO public.memories (title, caption, album, taken_date, location, image_data, aspect_hint, is_private)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, title, caption, album, taken_date, location, image_data, aspect_hint, is_private, created_at`,
        [title, caption, album, takenDate, location, imageData, aspectHint, isPrivate]
      );
      return res.status(201).json({ ok: true, item: inserted.rows[0] });
    } catch (err) {
      console.error("[api/memories] INSERT error:", err.message);
      return res.status(500).json({ ok: false, error: "Gagal menyimpan foto ke Supabase." });
    }
  }

  if (req.method === "DELETE") {
    if (!passcodeConfigured || !unlocked) {
      return res.status(401).json({ ok: false, error: "Akses penghapusan ditolak." });
    }
    const id = typeof req.query?.id === "string" ? req.query.id.trim() : "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return res.status(400).json({ ok: false, error: "ID foto tidak valid." });
    }
    try {
      await db.query(`DELETE FROM public.memories WHERE id = $1`, [id]);
      return res.status(200).json({ ok: true, id });
    } catch (err) {
      console.error("[api/memories] DELETE error:", err.message);
      return res.status(500).json({ ok: false, error: "Gagal menghapus foto." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
