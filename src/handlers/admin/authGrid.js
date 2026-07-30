const pool = require('../../db/pool');

async function listEmplRoles() {
  const r = await pool.query('SELECT role_id, role_name FROM empl_role ORDER BY role_id');
  return r.rows;
}

async function listRoleAuthTiers() {
  const r = await pool.query('SELECT auth_id, auth_name FROM role_auth ORDER BY auth_id');
  return r.rows;
}

async function getEmplRoleAuthMap() {
  const r = await pool.query(
    `SELECT er.role_id, er.role_name, era.auth_id, ra.auth_name
     FROM empl_role er
     LEFT JOIN empl_role_auth era ON era.role_id = er.role_id
     LEFT JOIN role_auth ra ON ra.auth_id = era.auth_id
     ORDER BY er.role_id`
  );
  return r.rows;
}

async function setEmplRoleAuth(roleId, authId) {
  const r = await pool.query(
    `INSERT INTO empl_role_auth (role_id, auth_id) VALUES ($1,$2)
     ON CONFLICT (role_id) DO UPDATE SET auth_id = EXCLUDED.auth_id
     RETURNING *`,
    [roleId, authId]
  );
  return r.rows[0];
}

module.exports = { listEmplRoles, listRoleAuthTiers, getEmplRoleAuthMap, setEmplRoleAuth };
