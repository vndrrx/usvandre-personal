/**
 * Sinkronisasi gabungan umpan Substack (@vandroidd) & Threads (@usvandrnr)
 * dengan cuplikan sebagian (partial excerpt) yang disimpan ke Supabase PostgreSQL (`social_posts`).
 */
const db = require("./db");
const { parseRssItems, makePartialExcerpt } = require("./substack");

const SUBSTACK_PROFILE_URL = "https://substack.com/@vandroidd";
const THREADS_PROFILE_URL = "https://www.threads.com/@usvandrnr";

async function fetchSubstackRssDirect() {
  const candidates = [];
  if (process.env.SUBSTACK_FEED_URL) {
    candidates.push(process.env.SUBSTACK_FEED_URL.trim());
  }
  candidates.push("https://vandroidd.substack.com/feed");

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": "UsvandreBlogBot/1.0" },
        signal: AbortSignal.timeout(4500)
      });
      if (!res.ok) continue;
      const ctype = (res.headers.get("content-type") || "").toLowerCase();
      const xml = await res.text();
      if (!(ctype.includes("xml") || xml.includes("<rss") || xml.includes("<feed"))) continue;
      const parsed = parseRssItems(xml).map((it) => ({
        platform: "substack",
        external_id: it.guid,
        title: it.title,
        excerpt: it.excerpt,
        link: it.link,
        published_at: it.published_at
      }));
      return { items: parsed, hasRss: true };
    } catch {
      // Lanjut ke kandidat lain
    }
  }
  return { items: [], hasRss: false };
}

async function fetchThreadsApiDirect() {
  const token = (process.env.THREADS_ACCESS_TOKEN || "").trim();
  if (!token) return [];
  try {
    const url = `https://graph.threads.net/v1.0/me/threads?fields=id,text,permalink,timestamp&limit=6&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data?.data) ? data.data : [];
    return list
      .filter((t) => t.text && t.permalink)
      .map((t) => ({
        platform: "threads",
        external_id: `threads:${t.id}`,
        title: makePartialExcerpt(t.text, 72),
        excerpt: makePartialExcerpt(t.text, 190),
        link: t.permalink,
        published_at: t.timestamp || null
      }));
  } catch {
    return [];
  }
}

async function getCombinedFeeds(platformFilter = "all") {
  const [substackRes, threadsList] = await Promise.all([
    fetchSubstackRssDirect(),
    fetchThreadsApiDirect()
  ]);

  const liveMerged = [...substackRes.items, ...threadsList];
  let dbConnected = false;

  if (db.hasDatabase()) {
    try {
      for (const item of liveMerged) {
        await db.query(
          `INSERT INTO public.social_posts (external_id, platform, title, excerpt, link, published_at, synced_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (external_id) DO UPDATE SET
             title = EXCLUDED.title,
             excerpt = EXCLUDED.excerpt,
             link = EXCLUDED.link,
             published_at = EXCLUDED.published_at,
             synced_at = NOW()`,
          [item.external_id, item.platform, item.title, item.excerpt, item.link, item.published_at]
        );
      }

      const params = [];
      let whereSql = "";
      if (platformFilter === "substack" || platformFilter === "threads") {
        params.push(platformFilter);
        whereSql = "WHERE platform = $1";
      }

      const cached = await db.query(
        `SELECT external_id, platform, title, excerpt, link, published_at, synced_at
         FROM public.social_posts
         ${whereSql}
         ORDER BY published_at DESC NULLS LAST, synced_at DESC
         LIMIT 6`,
        params
      );

      dbConnected = true;
      const rows = cached ? cached.rows : [];
      return {
        substackUrl: (process.env.SUBSTACK_PROFILE_URL || SUBSTACK_PROFILE_URL).trim(),
        threadsUrl: (process.env.THREADS_URL || THREADS_PROFILE_URL).trim(),
        dbConnected,
        hasSubstackRss: substackRes.hasRss,
        status: rows.length > 0 ? "ready" : "awaiting_posts",
        items: rows
      };
    } catch (err) {
      console.error("[feeds] SQL sync error:", err.message);
    }
  }

  const filteredLive =
    platformFilter === "substack" || platformFilter === "threads"
      ? liveMerged.filter((i) => i.platform === platformFilter)
      : liveMerged;

  return {
    substackUrl: (process.env.SUBSTACK_PROFILE_URL || SUBSTACK_PROFILE_URL).trim(),
    threadsUrl: (process.env.THREADS_URL || THREADS_PROFILE_URL).trim(),
    dbConnected,
    hasSubstackRss: substackRes.hasRss,
    status: filteredLive.length > 0 ? "ready" : "awaiting_posts",
    items: filteredLive.slice(0, 6)
  };
}

module.exports = {
  getCombinedFeeds
};
