const pool = require('../../db/pool');

async function getMainOffice() {
  const r = await pool.query('SELECT * FROM main_office ORDER BY id LIMIT 1');
  return r.rows[0];
}

async function updateMainOffice(id, data) {
  const r = await pool.query(
    `UPDATE main_office
     SET name=$1, address=$2, main_phone=$3, main_800=$4, busHrs=$5, siteurl=$6,
         zone=$7, pref_hrtick=$8, pref_allowSRbill=$9, pref_flexSRtime=$10, pref_reqGeoLoc=$11
     WHERE id=$12 RETURNING *`,
    [data.name, JSON.stringify(data.address || {}), data.main_phone, data.main_800,
     data.busHrs, data.siteurl, data.zone || 1, data.pref_hrtick || 15,
     !!data.pref_allowSRbill, !!data.pref_flexSRtime, !!data.pref_reqGeoLoc, id]
  );
  return r.rows[0];
}

async function listZones() {
  const r = await pool.query('SELECT * FROM zones ORDER BY zone_name');
  return r.rows;
}

async function createZone(data) {
  const r = await pool.query(
    `INSERT INTO zones (zone_name, zone_country, zone_time, zone_lang)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.zone_name, data.zone_country, data.zone_time, data.zone_lang || 'en']
  );
  return r.rows[0];
}

async function updateZone(id, data) {
  const r = await pool.query(
    `UPDATE zones SET zone_name=$1, zone_country=$2, zone_time=$3, zone_lang=$4
     WHERE zone_id=$5 RETURNING *`,
    [data.zone_name, data.zone_country, data.zone_time, data.zone_lang, id]
  );
  return r.rows[0];
}

async function deleteZone(id) {
  await pool.query('DELETE FROM zones WHERE zone_id = $1', [id]);
  return { deleted: true };
}

async function listSubOffices() {
  const r = await pool.query(
    `SELECT so.*, z.zone_name
     FROM sub_office so
     LEFT JOIN zones z ON z.zone_id = so.sub_zone
     ORDER BY so.sub_name`
  );
  return r.rows;
}

async function createSubOffice(data) {
  const r = await pool.query(
    `INSERT INTO sub_office
       (sub_name, sub_address, sub_phone, sub_800, sub_busHrs, sub_siteurl, sub_zone)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.sub_name, JSON.stringify(data.sub_address || {}), data.sub_phone, data.sub_800,
     data.sub_busHrs || 'Mon-Fri 8:00-17:00', data.sub_siteurl, data.sub_zone]
  );
  return r.rows[0];
}

async function updateSubOffice(id, data) {
  const r = await pool.query(
    `UPDATE sub_office
     SET sub_name=$1, sub_address=$2, sub_phone=$3, sub_800=$4, sub_busHrs=$5,
         sub_siteurl=$6, sub_zone=$7
     WHERE sub_id=$8 RETURNING *`,
    [data.sub_name, JSON.stringify(data.sub_address || {}), data.sub_phone, data.sub_800,
     data.sub_busHrs, data.sub_siteurl, data.sub_zone, id]
  );
  return r.rows[0];
}

async function deleteSubOffice(id) {
  await pool.query('DELETE FROM sub_office WHERE sub_id = $1', [id]);
  return { deleted: true };
}

module.exports = {
  getMainOffice, updateMainOffice,
  listZones, createZone, updateZone, deleteZone,
  listSubOffices, createSubOffice, updateSubOffice, deleteSubOffice,
};
