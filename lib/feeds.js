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

async function fetchThreadsFromApi() {
  const token = (process.env.THREADS_ACCESS_TOKEN || "").trim();
  if (!token) return { configured: false, ok: false, items: [] };
  try {
    const url = `https://graph.threads.net/v1.0/me/threads?fields=id,text,permalink,timestamp&limit=12&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return { configured: true, ok: false, items: [] };
    const data = await res.json();
    const list = Array.isArray(data?.data) ? data.data : [];
    const items = list
      .filter((t) => t.text && t.permalink)
      .map((t) => ({
        platform: "threads",
        external_id: `threads:${t.id}`,
        title: makePartialExcerpt(t.text, 72),
        excerpt: makePartialExcerpt(t.text, 190),
        link: t.permalink,
        published_at: t.timestamp || null
      }));
    return { configured: true, ok: true, items };
  } catch {
    return { configured: true, ok: false, items: [] };
  }
}

function getThreadsHandle() {
  const profileUrl = (process.env.THREADS_URL || THREADS_PROFILE_URL).trim();
  const handleMatch = profileUrl.match(/@([A-Za-z0-9_.]+)/);
  return handleMatch ? handleMatch[1] : "usvandrnr";
}

function extractThreadsPostsFromHtml(html, expectedHandle = "usvandrnr") {
  const scripts = [...html.matchAll(/<script[^>]*data-sjs[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const seen = new Set();
  const posts = [];
  const lowerHandle = expectedHandle.toLowerCase();

  function walk(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (Array.isArray(node.thread_items)) {
      for (const ti of node.thread_items) {
        const p = ti?.post;
        const username = (p?.user?.username || "").toLowerCase();
        const code = p?.code;
        if (!code || (username && username !== lowerHandle)) continue;
        if (seen.has(code)) continue;
        seen.add(code);
        posts.push(p);
      }
    }
    for (const val of Object.values(node)) walk(val);
  }

  for (const raw of scripts) {
    if (!raw.includes("thread_items")) continue;
    try {
      walk(JSON.parse(raw));
    } catch {
      // Abaikan blok JSON yang tidak valid
    }
  }

  posts.sort((a, b) => Number(b.taken_at || 0) - Number(a.taken_at || 0));
  return posts;
}

function parseThreadsPublicSsr(html, expectedHandle = "usvandrnr") {
  return extractThreadsPostsFromHtml(html, expectedHandle)
    .filter((p) => (p?.caption?.text || "").trim())
    .map((p) => {
      const text = (p.caption.text || "").trim();
      return {
        platform: "threads",
        external_id: `threads:${p.code}`,
        title: makePartialExcerpt(text, 72),
        excerpt: makePartialExcerpt(text, 190),
        link: `https://www.threads.com/@${expectedHandle}/post/${p.code}`,
        published_at: p.taken_at ? new Date(Number(p.taken_at) * 1000).toISOString() : null
      };
    });
}

async function fetchThreadsPublicHtml(handle) {
  try {
    const res = await fetch(`https://www.threads.com/@${handle}`, {
      headers: { Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(5500)
    });
    if (!res.ok || String(res.url || "").includes("/login")) return "";
    const html = await res.text();
    const looksLikeProfile =
      html.includes("thread_items") || html.toLowerCase().includes(handle.toLowerCase());
    return looksLikeProfile ? html : "";
  } catch {
    return "";
  }
}

async function fetchThreadsDirect() {
  const apiRes = await fetchThreadsFromApi();
  if (apiRes.configured && apiRes.ok) {
    return { reachable: true, items: apiRes.items };
  }

  const handle = getThreadsHandle();
  const html = await fetchThreadsPublicHtml(handle);
  if (!html) {
    return { reachable: false, items: [] };
  }
  return { reachable: true, items: parseThreadsPublicSsr(html, handle) };
}

function inferAspectHint(width, height) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  if (!w || !h) return "auto";
  if (Math.abs(w - h) / Math.max(w, h) < 0.12) return "square";
  return w > h ? "landscape" : "portrait";
}

function appendThreadsGraphItem(out, m) {
  const caption = String(m.text || "").trim();
  const takenDate = m.timestamp ? String(m.timestamp).slice(0, 10) : "";
  if (m.media_type === "CAROUSEL_ALBUM" && Array.isArray(m.children?.data) && m.children.data.length > 0) {
    const photos = m.children.data.filter(
      (c) => c.media_type === "IMAGE" && /^https:\/\//i.test(String(c.media_url || ""))
    );
    photos.forEach((child, idx) => {
      out.push({
        mediaUrl: String(child.media_url).trim(),
        caption,
        takenDate,
        aspectHint: "auto",
        carouselIndex: photos.length > 1 ? idx : -1,
        carouselTotal: photos.length
      });
    });
    return;
  }
  const url = String(m.media_url || "").trim();
  if ((m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM") && /^https:\/\//i.test(url)) {
    out.push({
      mediaUrl: url,
      caption,
      takenDate,
      aspectHint: "auto",
      carouselIndex: -1,
      carouselTotal: 1
    });
  }
}

function appendThreadsSsrItem(out, post) {
  const caption = String(post?.caption?.text || "").trim();
  const takenDate = post.taken_at ? new Date(Number(post.taken_at) * 1000).toISOString().slice(0, 10) : "";

  if (Array.isArray(post.carousel_media) && post.carousel_media.length > 0) {
    const photos = post.carousel_media
      .filter((c) => !c.video_versions?.length && /^https:\/\//i.test(c?.image_versions2?.candidates?.[0]?.url || ""))
      .map((c) => c.image_versions2.candidates[0]);
    photos.forEach((cand, idx) => {
      out.push({
        mediaUrl: cand.url.trim(),
        caption,
        takenDate,
        aspectHint: inferAspectHint(cand.width, cand.height),
        carouselIndex: photos.length > 1 ? idx : -1,
        carouselTotal: photos.length
      });
    });
    return;
  }

  const cand = post?.image_versions2?.candidates?.[0];
  if (post.media_type === 1 && !post.video_versions?.length && /^https:\/\//i.test(cand?.url || "")) {
    out.push({
      mediaUrl: cand.url.trim(),
      caption,
      takenDate,
      aspectHint: inferAspectHint(cand.width, cand.height),
      carouselIndex: -1,
      carouselTotal: 1
    });
  }
}

/**
 * Mengambil unggahan foto Threads (@usvandrnr): prioritas Meta Threads API (`THREADS_ACCESS_TOKEN`),
 * lalu fallback ke data SSR halaman publik Threads jika token belum diset.
 */
async function fetchThreadsMediaItems() {
  const token = (process.env.THREADS_ACCESS_TOKEN || "").trim();
  if (token) {
    const url =
      `https://graph.threads.net/v1.0/me/threads?fields=id,text,media_type,media_url,permalink,timestamp,children{media_type,media_url}&limit=12&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || "Gagal mengambil media dari Meta Threads API.");
      err.statusCode = res.status;
      throw err;
    }
    const items = [];
    for (const m of Array.isArray(data?.data) ? data.data : []) {
      appendThreadsGraphItem(items, m);
    }
    return { source: "api", items };
  }

  const handle = getThreadsHandle();
  const html = await fetchThreadsPublicHtml(handle);
  if (!html) {
    return { source: "public_ssr", reachable: false, items: [] };
  }
  const posts = extractThreadsPostsFromHtml(html, handle);
  const items = [];
  for (const post of posts) {
    appendThreadsSsrItem(items, post);
  }
  return { source: "public_ssr", reachable: true, items };
}

async function pruneDeletedPlatformPosts(platform, liveItems) {
  const activeIds = liveItems.map((it) => it.external_id);
  await db.query(
    `DELETE FROM public.social_posts
     WHERE platform = $1
       AND NOT (external_id = ANY($2::text[]))`,
    [platform, activeIds]
  );
}

async function getCombinedFeeds(platformFilter = "all") {
  const [substackRes, threadsRes] = await Promise.all([
    fetchSubstackRssDirect(),
    fetchThreadsDirect()
  ]);

  const liveMerged = [...substackRes.items, ...threadsRes.items].sort(
    (a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)
  );
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

      if (threadsRes.reachable) {
        await pruneDeletedPlatformPosts("threads", threadsRes.items);
      }
      if (substackRes.hasRss) {
        await pruneDeletedPlatformPosts("substack", substackRes.items);
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
  getCombinedFeeds,
  fetchThreadsMediaItems
};
