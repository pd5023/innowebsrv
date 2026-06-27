const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Ensure search_path is set to public on every new connection
pool.on('connect', (client) => {
  client.query('SET search_path TO public');
});

module.exports = pool;
