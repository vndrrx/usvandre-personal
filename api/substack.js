/**
 * GET /api/substack — Menarik cuplikan tulisan Substack (@vandroidd)
 * secara parsial dan menyimpannya ke tabel SQL `substack_posts`.
 */
const { syncAndGetSubstack } = require("../lib/substack");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = await syncAndGetSubstack();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(payload);
  } catch (err) {
    console.error("[api/substack] Error:", err.message);
    return res.status(200).json({
      profileUrl: "https://substack.com/@vandroidd",
      threadsUrl: "https://www.threads.com/@usvandrnr",
      hasRss: false,
      dbConnected: false,
      status: "awaiting_first_post",
      items: []
    });
  }
};
