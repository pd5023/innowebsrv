const pool = require('../../db/pool');

async function listClients() {
  const r = await pool.query('SELECT * FROM clients ORDER BY clt_name');
  return r.rows;
}

async function getClient(id) {
  const r = await pool.query('SELECT * FROM clients WHERE clt_id = $1', [id]);
  return r.rows[0];
}

async function createClient(data) {
  const r = await pool.query(
    `INSERT INTO clients
       (clt_name, clt_phone, clt_800, clt_busHrs, clt_siteurl, clt_zone, clt_subId)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.clt_name, data.clt_phone, data.clt_800, data.clt_busHrs,
     data.clt_siteurl, data.clt_zone || 1, data.clt_subId || 1]
  );
  return r.rows[0];
}

async function updateClient(id, data) {
  const r = await pool.query(
    `UPDATE clients
     SET clt_name=$1, clt_phone=$2, clt_800=$3, clt_busHrs=$4, clt_siteurl=$5,
         clt_zone=$6, pref_allowSRbill=$7, pref_flexSRtime=$8,
         pref_reqGeoLoc=$9, pref_reqSign=$10
     WHERE clt_id=$11 RETURNING *`,
    [data.clt_name, data.clt_phone, data.clt_800, data.clt_busHrs, data.clt_siteurl,
     data.clt_zone, data.pref_allowSRbill, data.pref_flexSRtime,
     data.pref_reqGeoLoc, data.pref_reqSign, id]
  );
  return r.rows[0];
}

async function deleteClient(id) {
  await pool.query('DELETE FROM clients WHERE clt_id = $1', [id]);
  return { deleted: true };
}

module.exports = { listClients, getClient, createClient, updateClient, deleteClient };
