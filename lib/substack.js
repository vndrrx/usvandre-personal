/**
 * Sinkronisasi Substack RSS (@vandroidd) menjadi cuplikan sebagian (partial excerpt)
 * dan menyimpannya ke tabel SQL `substack_posts` di Supabase bila database aktif.
 */
const db = require("./db");

const DEFAULT_PROFILE_URL = "https://substack.com/@vandroidd";
const DEFAULT_FEED_CANDIDATES = [
  "https://vandroidd.substack.com/feed"
];

function decodeXmlEntities(str) {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html) {
  return decodeXmlEntities(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makePartialExcerpt(text, maxChars = 210) {
  const clean = text.trim();
  if (!clean) return "";
  if (clean.length <= maxChars) return clean;
  const sliced = clean.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 120 ? sliced.slice(0, lastSpace) : sliced).trim() + "…";
}

function extractTag(block, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = block.match(regex);
  return match ? match[1].trim() : "";
}

function parseRssItems(xml) {
  const items = [];
  const itemMatches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  for (const raw of itemMatches.slice(0, 6)) {
    const title = stripHtml(extractTag(raw, "title"));
    const link = decodeXmlEntities(extractTag(raw, "link")).trim();
    const guid = decodeXmlEntities(extractTag(raw, "guid")).trim() || link || title;
    const pubDateRaw = decodeXmlEntities(extractTag(raw, "pubDate")).trim();
    const description = extractTag(raw, "description");
    const encoded = extractTag(raw, "content:encoded");
    const plainBody = stripHtml(description || encoded);
    const excerpt = makePartialExcerpt(plainBody, 210);

    let publishedAt = null;
    if (pubDateRaw) {
      const parsed = new Date(pubDateRaw);
      if (!Number.isNaN(parsed.getTime())) {
        publishedAt = parsed.toISOString();
      }
    }

    if (title && link) {
      items.push({
        guid,
        title,
        link,
        excerpt: excerpt || "Baca cuplikan tulisan terbaru ini langsung di Substack.",
        published_at: publishedAt,
        is_partial: true
      });
    }
  }

  return items;
}

async function discoverFeedFromProfile(profileUrl) {
  try {
    const res = await fetch(profileUrl, {
      redirect: "follow",
      headers: { "User-Agent": "UsvandreBlogBot/1.0 (+https://substack.com/@vandroidd)" },
      signal: AbortSignal.timeout(4500)
    });
    if (!res.ok) return null;
    const html = await res.text();
    const altMatch = html.match(/<link[^>]+type=["']application\/rss\+xml["'][^>]+href=["']([^"']+)["']/i);
    if (altMatch && altMatch[1]) return altMatch[1];
    const pubMatch = html.match(/https:\/\/([a-z0-9-]+)\.substack\.com/i);
    if (pubMatch && pubMatch[1] && pubMatch[1] !== "www") {
      return `https://${pubMatch[1]}.substack.com/feed`;
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchLiveSubstackItems() {
  const profileUrl = (process.env.SUBSTACK_PROFILE_URL || DEFAULT_PROFILE_URL).trim();
  const candidates = [];

  if (process.env.SUBSTACK_FEED_URL) {
    candidates.push(process.env.SUBSTACK_FEED_URL.trim());
  }
  candidates.push(...DEFAULT_FEED_CANDIDATES);

  const discovered = await discoverFeedFromProfile(profileUrl);
  if (discovered && !candidates.includes(discovered)) {
    candidates.unshift(discovered);
  }

  for (const feedUrl of candidates) {
    try {
      const res = await fetch(feedUrl, {
        redirect: "follow",
        headers: { "User-Agent": "UsvandreBlogBot/1.0" },
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) continue;
      const ctype = (res.headers.get("content-type") || "").toLowerCase();
      const body = await res.text();
      const looksLikeRss = ctype.includes("xml") || body.includes("<rss") || body.includes("<feed");
      if (!looksLikeRss) continue;

      const items = parseRssItems(body);
      return { items, feedUrl, hasRss: true };
    } catch {
      // Coba kandidat feed berikutnya
    }
  }

  return { items: [], feedUrl: candidates[0], hasRss: false };
}

async function syncAndGetSubstack() {
  const profileUrl = (process.env.SUBSTACK_PROFILE_URL || DEFAULT_PROFILE_URL).trim();
  const threadsUrl = (process.env.THREADS_URL || "https://www.threads.com/@usvandrnr").trim();
  const live = await fetchLiveSubstackItems();
  let dbConnected = false;

  if (db.hasDatabase()) {
    try {
      for (const item of live.items) {
        await db.query(
          `INSERT INTO public.substack_posts (guid, title, link, excerpt, published_at, synced_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (guid) DO UPDATE SET
             title = EXCLUDED.title,
             link = EXCLUDED.link,
             excerpt = EXCLUDED.excerpt,
             published_at = EXCLUDED.published_at,
             synced_at = NOW()`,
          [item.guid, item.title, item.link, item.excerpt, item.published_at]
        );
      }

      const cached = await db.query(
        `SELECT guid, title, link, excerpt, published_at, synced_at
         FROM public.substack_posts
         ORDER BY published_at DESC NULLS LAST, synced_at DESC
         LIMIT 4`
      );
      dbConnected = true;

      const rows = cached ? cached.rows : [];
      return {
        profileUrl,
        threadsUrl,
        feedUrl: live.feedUrl,
        hasRss: live.hasRss,
        dbConnected,
        status: rows.length > 0 ? "ready" : "awaiting_first_post",
        items: rows
      };
    } catch (err) {
      // Tetap lanjutkan dengan hasil live RSS jika koneksi DB gagal sementara
      console.error("[substack] SQL sync error:", err.message);
    }
  }

  return {
    profileUrl,
    threadsUrl,
    feedUrl: live.feedUrl,
    hasRss: live.hasRss,
    dbConnected,
    status: live.items.length > 0 ? "ready" : "awaiting_first_post",
    items: live.items.slice(0, 4)
  };
}

module.exports = {
  syncAndGetSubstack,
  makePartialExcerpt,
  parseRssItems
};
