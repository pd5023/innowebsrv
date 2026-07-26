const pool    = require('../../db/pool');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');

// Simple in-memory token store (replace with Redis/DB for production)
const sessions = new Map();

async function login(username, password) {
  const r = await pool.query(
    `SELECT empl_id, empl_name, empl_password, empl_clientPrim, empl_isActive
     FROM employees WHERE empl_username = $1`,
    [username]
  );
  if (!r.rows.length) return { error: 'Invalid credentials' };

  const user = r.rows[0];
  if (!user.empl_isactive) return { error: 'Account inactive' };

  const match = await bcrypt.compare(password, user.empl_password);
  if (!match) return { error: 'Invalid credentials' };

  const cltId = parseInt((user.empl_clientprim ?? '').replace(/\D/g, '')) || null;

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { id: user.empl_id, name: user.empl_name, clt_id: cltId });

  // Auto-expire after 8 hours
  setTimeout(() => sessions.delete(token), 8 * 60 * 60 * 1000);

  return { token, name: user.empl_name, id: user.empl_id };
}

function logout(token) {
  sessions.delete(token);
  return { ok: true };
}

function getSession(token) {
  return sessions.get(token) || null;
}

module.exports = { login, logout, getSession };
