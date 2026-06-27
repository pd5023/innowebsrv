const pool    = require('../../db/pool');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');

// Simple in-memory token store (replace with Redis/DB for production)
const sessions = new Map();

async function login(username, password) {
  const r = await pool.query(
    `SELECT c.cnt_id, c.name, c.password, c.clt_id, c.cat_id, c.is_active
     FROM contacts c WHERE c.username = $1`,
    [username]
  );
  if (!r.rows.length) return { error: 'Invalid credentials' };

  const user = r.rows[0];
  if (!user.is_active) return { error: 'Account inactive' };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { error: 'Invalid credentials' };

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { id: user.cnt_id, name: user.name, clt_id: user.clt_id });

  // Auto-expire after 8 hours
  setTimeout(() => sessions.delete(token), 8 * 60 * 60 * 1000);

  return { token, name: user.name, id: user.cnt_id };
}

function logout(token) {
  sessions.delete(token);
  return { ok: true };
}

function getSession(token) {
  return sessions.get(token) || null;
}

module.exports = { login, logout, getSession };