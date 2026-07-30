const pool   = require('../../db/pool');
const bcrypt = require('bcryptjs');

// Postgres folds unquoted mixed-case identifiers to lowercase, so SELECT * / RETURNING *
// on columns like empl_isActive comes back as `empl_isactive`, breaking JS code that expects
// `empl_isActive`. Alias every mixed-case column explicitly so the driver returns the exact
// key we expect.
const EMPLOYEE_COLS = `empl_id, empl_name, empl_email, empl_phone, empl_username,
  empl_isActive AS "empl_isActive", empl_clientPrim AS "empl_clientPrim",
  empl_clientSec AS "empl_clientSec", empl_role, empl_cats`;

async function listEmployees() {
  const r = await pool.query(
    `SELECT ${EMPLOYEE_COLS}
     FROM employees
     ORDER BY empl_name`
  );
  return r.rows;
}

async function createEmployee(data) {
  const hash = await bcrypt.hash(data.password || 'Password1', 10);
  const r = await pool.query(
    `INSERT INTO employees
       (empl_subId, empl_name, empl_email, empl_phone, empl_username, empl_password,
        empl_clientPrim, empl_clientSec, empl_role, empl_isActive)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING ${EMPLOYEE_COLS}`,
    [data.empl_subId || 1, data.empl_name, data.empl_email, data.empl_phone,
     data.empl_username, hash, data.empl_clientPrim || '', data.empl_clientSec || '',
     data.empl_role || 'Employee', data.empl_isActive !== false]
  );
  return r.rows[0];
}

async function updateEmployee(id, data) {
  const r = await pool.query(
    `UPDATE employees
     SET empl_name=$1, empl_email=$2, empl_phone=$3,
         empl_clientPrim=$4, empl_clientSec=$5,
         empl_role=$6, empl_isActive=$7
     WHERE empl_id=$8
     RETURNING ${EMPLOYEE_COLS}`,
    [data.empl_name, data.empl_email, data.empl_phone,
     data.empl_clientPrim || '', data.empl_clientSec || '',
     data.empl_role || 'Employee', data.empl_isActive !== false, id]
  );
  return r.rows[0];
}

async function resetPassword(id, newPassword) {
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE employees SET empl_password=$1 WHERE empl_id=$2', [hash, id]);
  return { ok: true };
}

module.exports = { listEmployees, createEmployee, updateEmployee, resetPassword };
