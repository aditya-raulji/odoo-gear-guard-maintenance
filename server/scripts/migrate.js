require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

(async () => {
  console.log('Running database migrations from database/schema.sql ...');
  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    // Some managed providers restrict CREATE EXTENSION; ignore/remove it if present
    sql = sql.replace(/CREATE\s+EXTENSION[\s\S]*?uuid-ossp";?/gi, '-- CREATE EXTENSION removed by migrate.js\n');

    await pool.query('BEGIN');
    await pool.query(sql);
    await pool.query('COMMIT');
    console.log('Migrations applied successfully.');
  } catch (err) {
    try { await pool.query('ROLLBACK'); } catch (_) {}
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
