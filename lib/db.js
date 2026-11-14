/**
 * Koneksi lazy pool PostgreSQL (kompatibel dengan Supabase Pooler & Vercel Functions).
 */
const { Pool } = require("pg");

let pool = null;

function getConnectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    ""
  ).trim();
}

function hasDatabase() {
  return Boolean(getConnectionString());
}

function getPool() {
  if (pool) return pool;
  const connectionString = getConnectionString();
  if (!connectionString) return null;

  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 6000,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });

  return pool;
}

async function query(text, params = []) {
  const db = getPool();
  if (!db) {
    return null;
  }
  return db.query(text, params);
}

module.exports = {
  hasDatabase,
  getPool,
  query
};
