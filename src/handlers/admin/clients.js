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
  const { clt_name, clt_main_nb, clt_siteurl, clt_lang, clt_zone } = data;
  const r = await pool.query(
    'INSERT INTO clients (clt_name, clt_main_nb, clt_siteurl, clt_lang, clt_zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [clt_name, clt_main_nb, clt_siteurl, clt_lang || 'en', clt_zone || 1]
  );
  return r.rows[0];
}
async function updateClient(id, data) {
  const { clt_name, clt_main_nb, clt_siteurl, clt_lang, clt_zone,
          pref_allowSRbill, pref_flexSRtime, pref_reqGeoLoc, clt_tc_lunch } = data;
  const r = await pool.query(
    `UPDATE clients SET clt_name=$1, clt_main_nb=$2, clt_siteurl=$3, clt_lang=$4,
     clt_zone=$5, pref_allowSRbill=$6, pref_flexSRtime=$7, pref_reqGeoLoc=$8, clt_tc_lunch=$9
     WHERE clt_id=$10 RETURNING *`,
    [clt_name, clt_main_nb, clt_siteurl, clt_lang, clt_zone,
     pref_allowSRbill, pref_flexSRtime, pref_reqGeoLoc, clt_tc_lunch, id]
  );
  return r.rows[0];
}
async function deleteClient(id) {
  await pool.query('DELETE FROM clients WHERE clt_id = $1', [id]);
  return { deleted: true };
}

module.exports = { listClients, getClient, createClient, updateClient, deleteClient };
