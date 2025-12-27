const { Pool } = require('pg');
require('dotenv').config();

// Prefer single DATABASE_URL if provided (e.g., Render external URL)
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' || /render\.com$/.test(new URL(process.env.DATABASE_URL).hostname)
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' }
      : undefined,
  });
} else {
  const host = process.env.DB_HOST || 'localhost';
  const enableSsl = process.env.DB_SSL === 'true' || /render\.com$/.test(host);
  pool = new Pool({
    host,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'gear_guard_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: enableSsl ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' } : undefined,
  });
}

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;

