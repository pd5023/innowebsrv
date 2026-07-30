const pool = require('../../db/pool');

async function listContacts(cltId) {
  const r = await pool.query(
    `SELECT cnt_id, cnt_cltId AS "cnt_cltId", cnt_deptId AS "cnt_deptId",
            cnt_name, cnt_email, cnt_phone, cnt_role, cnt_auth,
            cnt_isActive AS "cnt_isActive"
     FROM contacts
     WHERE cnt_cltId = $1
     ORDER BY cnt_name`,
    [cltId]
  );
  return r.rows;
}

async function createContact(data) {
  const r = await pool.query(
    `INSERT INTO contacts (cnt_cltId, cnt_deptId, cnt_name, cnt_email, cnt_phone, cnt_role, cnt_isActive)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING cnt_id, cnt_cltId AS "cnt_cltId", cnt_deptId AS "cnt_deptId",
               cnt_name, cnt_email, cnt_phone, cnt_role, cnt_isActive AS "cnt_isActive"`,
    [data.cnt_cltId, data.cnt_deptId || null, data.cnt_name, data.cnt_email,
     data.cnt_phone, data.cnt_role || null, data.cnt_isActive !== false]
  );
  return r.rows[0];
}

async function updateContact(id, data) {
  const r = await pool.query(
    `UPDATE contacts
     SET cnt_deptId=$1, cnt_name=$2, cnt_email=$3, cnt_phone=$4, cnt_role=$5, cnt_isActive=$6
     WHERE cnt_id=$7
     RETURNING cnt_id, cnt_cltId AS "cnt_cltId", cnt_deptId AS "cnt_deptId",
               cnt_name, cnt_email, cnt_phone, cnt_role, cnt_isActive AS "cnt_isActive"`,
    [data.cnt_deptId || null, data.cnt_name, data.cnt_email,
     data.cnt_phone, data.cnt_role || null, data.cnt_isActive !== false, id]
  );
  return r.rows[0];
}

async function deleteContact(id) {
  await pool.query('DELETE FROM contacts WHERE cnt_id = $1', [id]);
  return { deleted: true };
}

async function listCntRoles() {
  const r = await pool.query('SELECT role_id, role_name FROM cnt_role ORDER BY role_id');
  return r.rows;
}

module.exports = { listContacts, createContact, updateContact, deleteContact, listCntRoles };
