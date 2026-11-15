/**
 * Server lokal Node.js untuk pengembangan: melayani berkas statis dari `public/`
 * sekaligus menjalankan endpoint Vercel Functions (/api/*).
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_ROOT = path.join(PROJECT_ROOT, "public");
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function loadLocalEnv() {
  for (const name of [".env", ".env.local"]) {
    const fp = path.join(PROJECT_ROOT, name);
    if (!fs.existsSync(fp)) continue;
    for (const line of fs.readFileSync(fp, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

loadLocalEnv();

const apiRoutes = {
  "/api/posts": require("../api/posts"),
  "/api/portfolio": require("../api/portfolio"),
  "/api/substack": require("../api/substack"),
  "/api/contact": require("../api/contact")
};

function wrapResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    res.end(JSON.stringify(obj));
    return res;
  };
  return res;
}

function readRequestBody(req) {
  return new Promise((resolve) => {
    if (req.method === "GET" || req.method === "HEAD") return resolve("");
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on("end", () => resolve(body));
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = parsedUrl.pathname;

  if (apiRoutes[pathname]) {
    req.query = Object.fromEntries(parsedUrl.searchParams.entries());
    req.body = await readRequestBody(req);
    return apiRoutes[pathname](req, wrapResponse(res));
  }

  const safeRel = path.normalize(pathname === "/" ? "/index.html" : pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(PUBLIC_ROOT, safeRel);
  if (!filePath.startsWith(PUBLIC_ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, buf) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    return res.end(buf);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Server berjalan di http://127.0.0.1:${PORT}`);
});
