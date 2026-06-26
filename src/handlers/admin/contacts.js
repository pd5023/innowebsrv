const pool   = require('../../db/pool');
const bcrypt = require('bcryptjs');

async function listContacts(cltId) {
  const r = await pool.query(
    `SELECT c.cnt_id, c.name, c.email, c.phone, c.mobile, c.username,
            c.is_active, c.clt_id, c.cat_id, c.zone_id,
            cl.clt_name, z.zone_name
     FROM contacts c
     JOIN clients cl ON cl.clt_id = c.clt_id
     JOIN zones   z  ON z.zone_id = c.zone_id
     WHERE ($1::int IS NULL OR c.clt_id = $1)
     ORDER BY c.name`,
    [cltId || null]
  );
  return r.rows;
}
async function createContact(data) {
  const hash = await bcrypt.hash(data.password || 'Password1', 10);
  const r = await pool.query(
    `INSERT INTO contacts (clt_id, cat_id, zone_id, name, email, phone, mobile, username, password)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING cnt_id, name, email, username`,
    [data.clt_id, data.cat_id, data.zone_id, data.name, data.email, data.phone, data.mobile, data.username, hash]
  );
  return r.rows[0];
}
async function updateContact(id, data) {
  const r = await pool.query(
    `UPDATE contacts SET name=$1, email=$2, phone=$3, mobile=$4, zone_id=$5, is_active=$6
     WHERE cnt_id=$7 RETURNING cnt_id, name, email`,
    [data.name, data.email, data.phone, data.mobile, data.zone_id, data.is_active !== false, id]
  );
  return r.rows[0];
}
async function resetPassword(id, newPassword) {
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE contacts SET password=$1 WHERE cnt_id=$2', [hash, id]);
  return { ok: true };
}

module.exports = { listContacts, createContact, updateContact, resetPassword };
