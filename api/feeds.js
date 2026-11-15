/**
 * GET /api/feeds — Menggabungkan cuplikan tulisan Substack (@vandroidd) & Threads (@usvandrnr).
 */
const { getCombinedFeeds } = require("../lib/feeds");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const platform = typeof req.query?.platform === "string" ? req.query.platform.toLowerCase() : "all";
  try {
    const payload = await getCombinedFeeds(platform);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("[api/feeds] Error:", err.message);
    return res.status(200).json({
      substackUrl: "https://substack.com/@vandroidd",
      threadsUrl: "https://www.threads.com/@usvandrnr",
      dbConnected: false,
      status: "awaiting_posts",
      items: []
    });
  }
};
