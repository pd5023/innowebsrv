const pool    = require('../../db/pool');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');

// Simple in-memory token store (replace with Redis/DB for production)
const sessions = new Map();

async function login(username, password) {
  const r = await pool.query(
    `SELECT e.empl_id, e.empl_name, e.empl_password,
            e.empl_clientPrim AS "empl_clientPrim",
            e.empl_isActive AS "empl_isActive",
            e.empl_subId AS "empl_subId", e.empl_modals,
            ra.auth_name AS role,
            so.sub_zone
     FROM employees e
     LEFT JOIN sub_office so ON so.sub_id = e.empl_subId
     LEFT JOIN empl_role_auth era ON era.role_id = e.empl_titleId
     LEFT JOIN role_auth ra ON ra.auth_id = era.auth_id
     WHERE LOWER(e.empl_username) = LOWER($1)`,
    [username]
  );
  if (!r.rows.length) return { error: 'Invalid credentials' };

  const user = r.rows[0];
  if (!user.empl_isActive) return { error: 'Account inactive' };

  const match = await bcrypt.compare(password, user.empl_password);
  if (!match) return { error: 'Invalid credentials' };

  const cltId = parseInt((user.empl_clientPrim ?? '').replace(/\D/g, '')) || null;
  // No title assigned, or that title has no tier mapped yet — fall back to the
  // least-privileged tier rather than blocking login outright.
  const role = user.role || 'Employee';

  const session = {
    id:         user.empl_id,
    name:       user.empl_name,
    role,
    subId:      user.empl_subId,
    zone:       user.sub_zone,
    modalities: (user.empl_modals || '').split(',').map(Number).filter(Boolean),
    clt_id:     cltId,
  };

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, session);

  // Auto-expire after 8 hours
  setTimeout(() => sessions.delete(token), 8 * 60 * 60 * 1000);

  return { token, name: user.empl_name, id: user.empl_id, role };
}

function logout(token) {
  sessions.delete(token);
  return { ok: true };
}

function getSession(token) {
  return sessions.get(token) || null;
}

module.exports = { login, logout, getSession };
