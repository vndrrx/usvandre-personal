/**
 * POST /api/contact — Menyimpan pesan korespondensi pengunjung ke tabel SQL `contact_messages` di Supabase.
 */
const db = require("../lib/db");

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = parseBody(req);
  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 160);
  const subject = String(body.subject || "").trim().slice(0, 180);
  const message = String(body.message || "").trim().slice(0, 2000);

  if (!name || !subject || !message) {
    return res.status(400).json({ ok: false, error: "Nama, topik, dan pesan wajib diisi." });
  }

  if (db.hasDatabase()) {
    try {
      const inserted = await db.query(
        `INSERT INTO public.contact_messages (sender_name, sender_email, subject, message)
         VALUES ($1, $2, $3, $4)
         RETURNING id, created_at`,
        [name, email || null, subject, message]
      );
      return res.status(201).json({
        ok: true,
        savedToDatabase: true,
        id: inserted.rows[0]?.id || null,
        message: "Pesan tersimpan ke basis data Supabase."
      });
    } catch (err) {
      console.error("[api/contact] SQL error:", err.message);
    }
  }

  return res.status(200).json({
    ok: true,
    savedToDatabase: false,
    message: "Basis data belum terhubung; silakan lanjutkan melalui aplikasi surel."
  });
};
