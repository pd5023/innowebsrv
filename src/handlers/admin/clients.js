const pool = require('../../db/pool');

async function listClients() {
  const r = await pool.query(
    `SELECT c.*, z.zone_name, so.sub_name
     FROM clients c
     LEFT JOIN zones      z  ON z.zone_id = c.clt_zone
     LEFT JOIN sub_office so ON so.sub_id = c.clt_subId
     ORDER BY c.clt_name`
  );
  return r.rows;
}

async function getClient(id) {
  const r = await pool.query('SELECT * FROM clients WHERE clt_id = $1', [id]);
  return r.rows[0];
}

async function createClient(data) {
  const r = await pool.query(
    `INSERT INTO clients
       (clt_name, clt_address, clt_phone, clt_800, clt_busHrs, clt_siteurl,
        clt_zone, clt_subId, pref_hrtick, pref_allowSRbill, pref_flexSRtime,
        pref_reqGeoLoc, pref_reqSign)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [data.clt_name, JSON.stringify(data.clt_address || {}), data.clt_phone, data.clt_800,
     data.clt_busHrs, data.clt_siteurl, data.clt_zone || 1, data.clt_subId || 1,
     data.pref_hrtick || 15, !!data.pref_allowSRbill, !!data.pref_flexSRtime,
     !!data.pref_reqGeoLoc, data.pref_reqSign !== false]
  );
  return r.rows[0];
}

async function updateClient(id, data) {
  const r = await pool.query(
    `UPDATE clients
     SET clt_name=$1, clt_address=$2, clt_phone=$3, clt_800=$4, clt_busHrs=$5,
         clt_siteurl=$6, clt_zone=$7, clt_subId=$8, pref_hrtick=$9,
         pref_allowSRbill=$10, pref_flexSRtime=$11, pref_reqGeoLoc=$12, pref_reqSign=$13
     WHERE clt_id=$14 RETURNING *`,
    [data.clt_name, JSON.stringify(data.clt_address || {}), data.clt_phone, data.clt_800,
     data.clt_busHrs, data.clt_siteurl, data.clt_zone, data.clt_subId, data.pref_hrtick,
     !!data.pref_allowSRbill, !!data.pref_flexSRtime, !!data.pref_reqGeoLoc,
     data.pref_reqSign !== false, id]
  );
  return r.rows[0];
}

async function deleteClient(id) {
  await pool.query('DELETE FROM clients WHERE clt_id = $1', [id]);
  return { deleted: true };
}

async function listZones() {
  const r = await pool.query('SELECT zone_id, zone_name FROM zones ORDER BY zone_name');
  return r.rows;
}

async function listSubOffices() {
  const r = await pool.query('SELECT sub_id, sub_name FROM sub_office ORDER BY sub_name');
  return r.rows;
}

module.exports = { listClients, getClient, createClient, updateClient, deleteClient, listZones, listSubOffices };
