const pool = require('../../db/pool');

// Postgres folds unquoted mixed-case identifiers to lowercase, so SELECT * / RETURNING *
// on columns like busHrs comes back as `bushrs`, breaking JS code that expects `busHrs`.
// Alias every mixed-case column explicitly so the driver returns the exact key we expect.
const MAIN_OFFICE_COLS = `id, name, address, main_phone, main_800,
  busHrs AS "busHrs", siteurl, zone, pref_hrtick,
  pref_allowSRbill AS "pref_allowSRbill",
  pref_flexSRtime AS "pref_flexSRtime",
  pref_reqGeoLoc AS "pref_reqGeoLoc"`;

const SUB_OFFICE_COLS = `so.sub_id, so.sub_name, so.sub_address, so.sub_phone, so.sub_800,
  so.sub_busHrs AS "sub_busHrs", so.sub_siteurl,
  so.sub_mainId AS "sub_mainId", so.sub_zone,
  so.sub_pref_sameAsMain AS "sub_pref_sameAsMain",
  so.sub_pref_hrtick,
  so.sub_pref_allowSRbill AS "sub_pref_allowSRbill",
  so.sub_pref_flexSRtime AS "sub_pref_flexSRtime",
  so.sub_pref_reqGeoLoc AS "sub_pref_reqGeoLoc"`;

async function getMainOffice() {
  const r = await pool.query(`SELECT ${MAIN_OFFICE_COLS} FROM main_office ORDER BY id LIMIT 1`);
  return r.rows[0];
}

async function updateMainOffice(id, data) {
  const r = await pool.query(
    `UPDATE main_office
     SET name=$1, address=$2, main_phone=$3, main_800=$4, busHrs=$5, siteurl=$6,
         zone=$7, pref_hrtick=$8, pref_allowSRbill=$9, pref_flexSRtime=$10, pref_reqGeoLoc=$11
     WHERE id=$12 RETURNING ${MAIN_OFFICE_COLS}`,
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
    `SELECT ${SUB_OFFICE_COLS}, z.zone_name
     FROM sub_office so
     LEFT JOIN zones z ON z.zone_id = so.sub_zone
     ORDER BY so.sub_name`
  );
  return r.rows;
}

// Only one sub-office may be flagged "same as main" at a time — enforced here
// regardless of what the UI sends, in case the checkbox guard is ever bypassed.
async function createSubOffice(data) {
  if (data.sub_pref_sameAsMain) {
    await pool.query('UPDATE sub_office SET sub_pref_sameAsMain = FALSE');
  }
  const r = await pool.query(
    `INSERT INTO sub_office
       (sub_name, sub_address, sub_phone, sub_800, sub_busHrs, sub_siteurl, sub_zone, sub_pref_sameAsMain)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING ${SUB_OFFICE_COLS.replace(/so\./g, '')}`,
    [data.sub_name, JSON.stringify(data.sub_address || {}), data.sub_phone, data.sub_800,
     data.sub_busHrs || 'Mon-Fri 8:00-17:00', data.sub_siteurl, data.sub_zone, !!data.sub_pref_sameAsMain]
  );
  return r.rows[0];
}

async function updateSubOffice(id, data) {
  if (data.sub_pref_sameAsMain) {
    await pool.query('UPDATE sub_office SET sub_pref_sameAsMain = FALSE WHERE sub_id != $1', [id]);
  }
  const r = await pool.query(
    `UPDATE sub_office
     SET sub_name=$1, sub_address=$2, sub_phone=$3, sub_800=$4, sub_busHrs=$5,
         sub_siteurl=$6, sub_zone=$7, sub_pref_sameAsMain=$8
     WHERE sub_id=$9 RETURNING ${SUB_OFFICE_COLS.replace(/so\./g, '')}`,
    [data.sub_name, JSON.stringify(data.sub_address || {}), data.sub_phone, data.sub_800,
     data.sub_busHrs, data.sub_siteurl, data.sub_zone, !!data.sub_pref_sameAsMain, id]
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
