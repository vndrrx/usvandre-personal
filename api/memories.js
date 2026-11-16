/**
 * /api/memories — Galeri Kenangan Foto Pribadi (Supabase PostgreSQL + Email Auth).
 * Unggah, hapus, dan akses foto privat HANYA diizinkan untuk akun Supabase terverifikasi
 * dengan email `usvanndrenur@gmail.com`.
 */
const db = require("../lib/db");
const { fetchThreadsMediaItems } = require("../lib/feeds");

const DEFAULT_SUPABASE_URL = "https://picbctcfkyoajiivlwvv.supabase.co";
const DEFAULT_ALLOWED_EMAIL = "usvanndrenur@gmail.com";

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

function getAuthConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL)
    .trim()
    .replace(/\/$/, "");
  const supabaseAnonKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.SUPABASE_KEY ||
    ""
  ).trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const serverApiKey = supabaseAnonKey || serviceRoleKey;
  const allowedEmail = (process.env.ALLOWED_MEMORIES_EMAIL || DEFAULT_ALLOWED_EMAIL).trim().toLowerCase();
  return {
    supabaseUrl,
    supabaseAnonKey,
    serverApiKey,
    allowedEmail,
    authConfigured: Boolean(supabaseUrl && serverApiKey)
  };
}

async function verifyOwnerToken(req) {
  const { supabaseUrl, serverApiKey, allowedEmail, authConfigured } = getAuthConfig();
  if (!authConfigured) {
    return { authorized: false, reason: "SUPABASE_ANON_KEY_MISSING", email: null };
  }

  const authHeader = String(req.headers.authorization || "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return { authorized: false, reason: "NO_TOKEN", email: null };
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: serverApiKey,
        Authorization: `Bearer ${token}`
      },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) {
      return { authorized: false, reason: "INVALID_TOKEN", email: null };
    }
    const user = await res.json();
    const userEmail = String(user?.email || "").trim().toLowerCase();
    const confirmed = Boolean(user?.email_confirmed_at || user?.confirmed_at);
    if (!userEmail || userEmail !== allowedEmail || !confirmed) {
      return { authorized: false, reason: "EMAIL_FORBIDDEN", email: userEmail || null };
    }
    return { authorized: true, reason: "OK", email: userEmail };
  } catch {
    return { authorized: false, reason: "AUTH_CHECK_FAILED", email: null };
  }
}

function isValidImageSource(src) {
  if (typeof src !== "string") return false;
  const trimmed = src.trim();
  if (trimmed.length < 12 || trimmed.length > 3_500_000) return false;
  if (/^https:\/\//i.test(trimmed)) return true;
  if (/^\/assets\/rpl3\/[a-z0-9/_.-]+\.(?:webp|jpe?g|png|avif)$/i.test(trimmed)) return true;
  if (/^data:image\/(?:webp|jpeg|jpg|png|avif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) return true;
  return false;
}

/**
 * Mengunduh gambar jarak jauh (CDN Meta IG/Threads) menjadi Data URI agar tidak kedaluwarsa saat URL bertanda tangan berakhir.
 */
async function downloadRemoteImageAsDataUri(url) {
  try {
    const imgRes = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!imgRes.ok) return url;
    const rawType = (imgRes.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const mimeMatch = rawType.match(/^image\/(webp|jpeg|jpg|png|avif)$/);
    if (!mimeMatch) return url;
    const mime = mimeMatch[1] === "jpg" ? "image/jpeg" : `image/${mimeMatch[1]}`;
    const buf = Buffer.from(await imgRes.arrayBuffer());
    if (buf.length === 0 || buf.length > 2_200_000) return url;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return url;
  }
}

function extractGraphMediaItems(rawList, captionField) {
  const items = [];
  for (const m of Array.isArray(rawList) ? rawList : []) {
    const caption = String(m[captionField] || "").trim();
    const takenDate = m.timestamp ? String(m.timestamp).slice(0, 10) : "";
    if (m.media_type === "CAROUSEL_ALBUM" && Array.isArray(m.children?.data) && m.children.data.length > 0) {
      const photos = m.children.data.filter(
        (c) => c.media_type === "IMAGE" && /^https:\/\//i.test(String(c.media_url || ""))
      );
      photos.forEach((child, idx) => {
        items.push({
          mediaUrl: String(child.media_url).trim(),
          caption,
          takenDate,
          aspectHint: "auto",
          carouselIndex: photos.length > 1 ? idx : -1,
          carouselTotal: photos.length
        });
      });
      continue;
    }
    const url = String(m.media_url || "").trim();
    if ((m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM") && /^https:\/\//i.test(url)) {
      items.push({
        mediaUrl: url,
        caption,
        takenDate,
        aspectHint: "auto",
        carouselIndex: -1,
        carouselTotal: 1
      });
    }
  }
  return items;
}

async function syncPlatformMemories({ items, album, location, defaultTitle, pruneRemoved = false }) {
  const existingRes = await db.query(
    `SELECT id, title, caption, taken_date, image_data FROM public.memories WHERE album = $1`,
    [album]
  );
  const existingRows = existingRes?.rows || [];
  const byImageData = new Map();
  const byMetaKey = new Map();
  const byCaptionKey = new Map();
  const rowById = new Map();

  for (const row of existingRows) {
    rowById.set(row.id, row);
    if (row.image_data && !byImageData.has(row.image_data)) byImageData.set(row.image_data, row.id);
    const metaKey = `${row.title}::${row.taken_date}`;
    if (!byMetaKey.has(metaKey)) byMetaKey.set(metaKey, row.id);
    const cleanCap = String(row.caption || "").trim();
    if (cleanCap) {
      const slideMatch = String(row.title || "").match(/\((\d+\/\d+)\)\s*$/);
      const capKey = `${cleanCap}::${row.taken_date}::${slideMatch ? slideMatch[1] : ""}`;
      if (!byCaptionKey.has(capKey)) byCaptionKey.set(capKey, row.id);
    }
  }

  const keepIds = new Set();
  let added = 0;

  for (const item of items) {
    const rawCaption = String(item.caption || "").trim();
    const slideTag =
      item.carouselIndex >= 0 && item.carouselTotal > 1
        ? `${item.carouselIndex + 1}/${item.carouselTotal}`
        : "";
    const title = slideTag ? `${defaultTitle} (${slideTag})`.slice(0, 140) : defaultTitle;
    const takenDate = String(item.takenDate || "").trim().slice(0, 40);
    const metaKey = `${title}::${takenDate}`;
    const trimmedCap = rawCaption.slice(0, 600);
    const capKey = trimmedCap ? `${trimmedCap}::${takenDate}::${slideTag}` : "";

    const matchedId =
      byImageData.get(item.mediaUrl) ||
      (rawCaption ? byMetaKey.get(metaKey) : null) ||
      (capKey ? byCaptionKey.get(capKey) : null);

    if (matchedId) {
      keepIds.add(matchedId);
      const existingRow = rowById.get(matchedId);
      const existingCap = String(existingRow?.caption || "").trim();
      const existingTitleBare = String(existingRow?.title || "")
        .replace(/\s*\(\d+\/\d+\)\s*$/, "")
        .trim()
        .toLowerCase();
      if (
        existingRow &&
        existingRow.title !== title &&
        existingCap &&
        existingTitleBare &&
        existingCap.toLowerCase().startsWith(existingTitleBare)
      ) {
        await db.query(`UPDATE public.memories SET title = $1 WHERE id = $2`, [title, matchedId]);
        existingRow.title = title;
      }
      continue;
    }

    const finalImageData = await downloadRemoteImageAsDataUri(item.mediaUrl);
    if (!isValidImageSource(finalImageData)) continue;

    const dupByBytesId = byImageData.get(finalImageData);
    if (dupByBytesId) {
      keepIds.add(dupByBytesId);
      continue;
    }

    const aspectHint = ["portrait", "landscape", "square", "auto"].includes(item.aspectHint)
      ? item.aspectHint
      : "auto";

    const insRes = await db.query(
      `INSERT INTO public.memories (title, caption, album, taken_date, location, image_data, aspect_hint, is_private)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
       RETURNING id`,
      [title, trimmedCap, album, takenDate, location, finalImageData, aspectHint]
    );
    const insertedId = insRes?.rows?.[0]?.id;
    if (insertedId) {
      keepIds.add(insertedId);
      byImageData.set(finalImageData, insertedId);
      byImageData.set(item.mediaUrl, insertedId);
      if (rawCaption) byMetaKey.set(metaKey, insertedId);
      if (capKey) byCaptionKey.set(capKey, insertedId);
    }
    added++;
  }

  let removed = 0;
  if (pruneRemoved && existingRows.length > 0) {
    const delRes = await db.query(
      `DELETE FROM public.memories
       WHERE album = $1
         AND NOT (id = ANY($2::uuid[]))`,
      [album, [...keepIds]]
    );
    removed = delRes?.rowCount || 0;
  }

  return { added, removed };
}

let threadsAutoSyncPromise = null;
let lastThreadsAutoSyncAt = 0;
const THREADS_SYNC_TTL_MS = 20 * 1000;

async function ensureSyncedThreadsMemories({ force = false } = {}) {
  if (!force && Date.now() - lastThreadsAutoSyncAt < THREADS_SYNC_TTL_MS) return;
  if (threadsAutoSyncPromise) return threadsAutoSyncPromise;
  threadsAutoSyncPromise = (async () => {
    try {
      const result = await fetchThreadsMediaItems();
      const canPrune = result.source === "api" || result.reachable === true;
      if (canPrune) {
        await syncPlatformMemories({
          items: result.items,
          album: "Threads",
          location: "Threads @usvandrnr",
          defaultTitle: "Unggahan Threads @usvandrnr",
          pruneRemoved: true
        });
        lastThreadsAutoSyncAt = Date.now();
      }
    } catch (err) {
      console.error("[api/memories] Auto-sync Threads error:", err.message);
    } finally {
      threadsAutoSyncPromise = null;
    }
  })();
  return threadsAutoSyncPromise;
}

module.exports = async function handler(req, res) {
  const authCfg = getAuthConfig();
  const authResult = await verifyOwnerToken(req);
  const unlocked = authResult.authorized;

  if (req.method === "GET") {
    const scope = typeof req.query?.scope === "string" && req.query.scope.trim() === "rpl3" ? "rpl3" : "default";
    const album = typeof req.query?.album === "string" ? req.query.album.trim() : "";
    const q = typeof req.query?.q === "string" ? req.query.q.trim() : "";
    const sort = req.query?.sort === "oldest" ? "ASC" : "DESC";
    const maxLimit = scope === "rpl3" ? 120 : 48;
    const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(req.query?.limit, 10) || (scope === "rpl3" ? 100 : 24)));
    const offset = Math.max(0, Number.parseInt(req.query?.offset, 10) || 0);

    const basePayload = {
      authConfigured: authCfg.authConfigured,
      supabaseUrl: authCfg.supabaseUrl,
      supabaseAnonKey: authCfg.authConfigured ? authCfg.supabaseAnonKey : "",
      unlocked,
      verifiedEmail: unlocked ? authResult.email : null,
      authErrorReason: authResult.reason !== "NO_TOKEN" && !unlocked ? authResult.reason : null
    };

    if (!db.hasDatabase()) {
      return res.status(200).json({
        ...basePayload,
        dbConnected: false,
        total: 0,
        hasMore: false,
        albums: [],
        items: []
      });
    }

    try {
      if (scope !== "rpl3") {
        await ensureSyncedThreadsMemories({ force: false });
      }

      const conditions = [];
      const params = [];

      if (scope === "rpl3") {
        conditions.push("album LIKE 'RPL3:%'");
      } else {
        conditions.push("(album = '' OR album NOT LIKE 'RPL3:%')");
      }

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
      const listParams = [...params, limit, offset];
      const albumScopeCond = scope === "rpl3" ? "album LIKE 'RPL3:%'" : "album <> '' AND album NOT LIKE 'RPL3:%'";
      const albumWhere = unlocked ? `WHERE ${albumScopeCond}` : `WHERE ${albumScopeCond} AND is_private = FALSE`;

      const [countRes, rowsRes, albumsRes] = await Promise.all([
        db.query(`SELECT COUNT(*)::int AS total FROM public.memories ${whereSql}`, params),
        db.query(
          `SELECT id, title, caption, album, taken_date, location, image_data, aspect_hint, is_private, created_at
           FROM public.memories
           ${whereSql}
           ORDER BY created_at ${sort}, id DESC
           LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
          listParams
        ),
        db.query(`SELECT DISTINCT album FROM public.memories ${albumWhere} ORDER BY album ASC`)
      ]);

      const total = countRes?.rows?.[0]?.total || 0;
      const dbAlbums = (albumsRes?.rows || []).map((r) => r.album).filter(Boolean);

      res.setHeader("Cache-Control", "private, no-store");
      return res.status(200).json({
        ...basePayload,
        dbConnected: true,
        total,
        hasMore: offset + (rowsRes?.rows?.length || 0) < total,
        albums: dbAlbums,
        items: rowsRes?.rows || []
      });
    } catch (err) {
      console.error("[api/memories] GET error:", err.message);
      return res.status(500).json({ error: "Gagal memuat arsip foto kenangan." });
    }
  }

  if (req.method === "POST") {
    const action = typeof req.query?.action === "string" ? req.query.action.trim() : "";

    if (action === "send-otp" || action === "verify-otp" || action === "password-login") {
      if (!authCfg.authConfigured) {
        return res.status(503).json({
          ok: false,
          error: "SUPABASE_ANON_KEY belum terpasang di Environment Variables Vercel."
        });
      }

      const body = parseBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      if (!email || email !== authCfg.allowedEmail) {
        return res.status(403).json({
          ok: false,
          error: "Email tersebut tidak terdaftar sebagai pengelola arsip."
        });
      }

      try {
        if (action === "send-otp") {
          const redirectTo = String(body.redirectTo || "").trim();
          const otpEndpoint = redirectTo
            ? `${authCfg.supabaseUrl}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`
            : `${authCfg.supabaseUrl}/auth/v1/otp`;
          const otpRes = await fetch(otpEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: authCfg.serverApiKey
            },
            body: JSON.stringify({
              email,
              create_user: true,
              ...(redirectTo ? { redirect_to: redirectTo } : {})
            }),
            signal: AbortSignal.timeout(8000)
          });
          const otpData = await otpRes.json().catch(() => ({}));
          if (!otpRes.ok) {
            return res.status(otpRes.status).json({
              ok: false,
              error: otpData.msg || otpData.error_description || "Gagal mengirim email verifikasi."
            });
          }
          return res.status(200).json({ ok: true, sent: true });
        }

        if (action === "verify-otp") {
          const token = String(body.token || "").trim();
          if (!token) {
            return res.status(400).json({ ok: false, error: "Masukkan kode OTP dari email terlebih dahulu." });
          }
          const verifyRes = await fetch(`${authCfg.supabaseUrl}/auth/v1/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: authCfg.serverApiKey
            },
            body: JSON.stringify({ type: "email", email, token }),
            signal: AbortSignal.timeout(8000)
          });
          const verifyData = await verifyRes.json().catch(() => ({}));
          if (!verifyRes.ok || !verifyData.access_token) {
            return res.status(verifyRes.status || 401).json({
              ok: false,
              error: verifyData.msg || verifyData.error_description || "Kode OTP tidak valid atau sudah kedaluwarsa."
            });
          }
          return res.status(200).json({ ok: true, access_token: verifyData.access_token });
        }

        const password = String(body.password || "");
        if (!password) {
          return res.status(400).json({ ok: false, error: "Masukkan kata sandi akun terlebih dahulu." });
        }
        const pwRes = await fetch(`${authCfg.supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: authCfg.serverApiKey
          },
          body: JSON.stringify({ email, password }),
          signal: AbortSignal.timeout(8000)
        });
        const pwData = await pwRes.json().catch(() => ({}));
        if (!pwRes.ok || !pwData.access_token) {
          return res.status(pwRes.status || 401).json({
            ok: false,
            error: pwData.msg || pwData.error_description || "Kata sandi salah atau akun belum memakai sandi Supabase."
          });
        }
        return res.status(200).json({ ok: true, access_token: pwData.access_token });
      } catch {
        return res.status(502).json({
          ok: false,
          error: "Gagal menghubungi server Supabase Auth."
        });
      }
    }

    if (!authCfg.authConfigured) {
      return res.status(503).json({
        ok: false,
        error: "SUPABASE_ANON_KEY belum diset di Environment Variables Vercel."
      });
    }
    if (!unlocked) {
      const msg =
        authResult.reason === "EMAIL_FORBIDDEN"
          ? "Akses ditolak. Email tersebut tidak terdaftar sebagai pengelola arsip."
          : "Silakan verifikasi login pengelola arsip terlebih dahulu.";
      return res.status(authResult.reason === "EMAIL_FORBIDDEN" ? 403 : 401).json({ ok: false, error: msg });
    }

    if (req.query?.action === "verify") {
      return res.status(200).json({ ok: true, unlocked: true, email: authResult.email });
    }

    if (!db.hasDatabase()) {
      return res.status(503).json({ ok: false, error: "Basis data Supabase belum terhubung." });
    }

    if (req.query?.action === "sync-instagram") {
      const igToken = (process.env.INSTAGRAM_ACCESS_TOKEN || "").trim();
      if (!igToken) {
        return res.status(501).json({
          ok: false,
          error: "INSTAGRAM_ACCESS_TOKEN resmi Meta Graph API belum diset di Environment Variables Vercel."
        });
      }
      try {
        const igRes = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,children{media_type,media_url}&limit=12&access_token=${encodeURIComponent(igToken)}`,
          { signal: AbortSignal.timeout(8000) }
        );
        const igData = await igRes.json().catch(() => ({}));
        if (!igRes.ok) {
          return res.status(igRes.status).json({
            ok: false,
            error: igData?.error?.message || "Gagal mengambil media dari Instagram Graph API."
          });
        }
        const items = extractGraphMediaItems(igData?.data, "caption");
        const { added, removed } = await syncPlatformMemories({
          items,
          album: "Instagram",
          location: "Instagram @usvandrnr",
          defaultTitle: "Unggahan Instagram @usvandrnr",
          pruneRemoved: true
        });
        return res.status(200).json({ ok: true, added, removed, source: "api" });
      } catch {
        return res.status(502).json({ ok: false, error: "Gagal menghubungi Instagram Graph API." });
      }
    }

    if (req.query?.action === "sync-threads") {
      try {
        const result = await fetchThreadsMediaItems();
        if (result.source === "public_ssr" && result.reachable === false) {
          return res.status(501).json({
            ok: false,
            error:
              "THREADS_ACCESS_TOKEN belum diset di Vercel dan halaman publik Threads tidak dapat diakses dari server saat ini."
          });
        }
        const { added, removed } = await syncPlatformMemories({
          items: result.items,
          album: "Threads",
          location: "Threads @usvandrnr",
          defaultTitle: "Unggahan Threads @usvandrnr",
          pruneRemoved: result.source === "api" || result.reachable === true
        });
        lastThreadsAutoSyncAt = Date.now();
        return res.status(200).json({ ok: true, added, removed, source: result.source });
      } catch (err) {
        return res.status(err?.statusCode || 502).json({
          ok: false,
          error: err?.message || "Gagal mengambil media dari Threads."
        });
      }
    }

    if (req.query?.action === "upsert-rpl3-quote") {
      const body = parseBody(req);
      const slug = String(body.slug || "").trim().slice(0, 80);
      const studentName = String(body.studentName || "").trim().slice(0, 120);
      const quote = String(body.quote || "").trim().slice(0, 320);
      const imagePath = String(body.imagePath || "").trim();

      if (!slug || !studentName || !isValidImageSource(imagePath)) {
        return res.status(400).json({
          ok: false,
          error: "Data siswa atau jalur foto tidak valid."
        });
      }

      try {
        const existing = await db.query(
          `SELECT id FROM public.memories WHERE album = 'RPL3:Quote' AND location = $1 LIMIT 1`,
          [slug]
        );
        if (existing?.rows?.length > 0) {
          const updated = await db.query(
            `UPDATE public.memories
             SET title = $1, caption = $2, image_data = $3
             WHERE id = $4
             RETURNING id, title, caption, album, taken_date, location, image_data, aspect_hint, is_private, created_at`,
            [studentName, quote, imagePath, existing.rows[0].id]
          );
          return res.status(200).json({ ok: true, item: updated.rows[0] });
        }

        const inserted = await db.query(
          `INSERT INTO public.memories (title, caption, album, taken_date, location, image_data, aspect_hint, is_private)
           VALUES ($1, $2, 'RPL3:Quote', '2021-2024', $3, $4, 'portrait', FALSE)
           RETURNING id, title, caption, album, taken_date, location, image_data, aspect_hint, is_private, created_at`,
          [studentName, quote, slug, imagePath]
        );
        return res.status(201).json({ ok: true, item: inserted.rows[0] });
      } catch (err) {
        console.error("[api/memories] upsert-rpl3-quote error:", err.message);
        return res.status(500).json({ ok: false, error: "Gagal menyimpan kata-kata siswa ke Supabase." });
      }
    }

    const body = parseBody(req);
    const title = String(body.title || "").trim().slice(0, 140) || "Tanpa Judul";
    const caption = String(body.caption || "").trim().slice(0, 600);
    const album = String(body.album || "").trim().slice(0, 60);
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
    if (!authCfg.authConfigured || !unlocked) {
      return res.status(403).json({ ok: false, error: "Akses ditolak. Hanya pengelola terverifikasi yang dapat menghapus foto." });
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
