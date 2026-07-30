const pool = require('../../db/pool');
const { SCOPE, scopeOf } = require('../../policy/policy');

// Postgres folds unquoted mixed-case identifiers to lowercase, so SELECT * / RETURNING *
// on columns like eqp_roomAlias comes back as `eqp_roomalias`, breaking JS code that expects
// `eqp_roomAlias`. Alias every mixed-case column explicitly so the driver returns the exact
// key we expect.
const EQUIPMENT_COLS = `eqp_id, eqp_cltId AS "eqp_cltId", eqp_deptId AS "eqp_deptId",
  eqp_modalId AS "eqp_modalId", eqp_makeId AS "eqp_makeId",
  eqp_alias, eqp_model, eqp_serial, eqp_barcode,
  eqp_roomAlias AS "eqp_roomAlias", eqp_isActive AS "eqp_isActive",
  eqp_emails, eqp_isContract AS "eqp_isContract",
  eqp_srvcBy AS "eqp_srvcBy", eqp_vendor`;

async function listEquipment(cltId, auth) {
  const filters = ['($1::int IS NULL OR e.eqp_cltId = $1)'];
  const params  = [cltId || null];

  const scope = scopeOf(auth?.role);
  if (scope === SCOPE.SUBOFFICE || scope === SCOPE.SUBOFFICE_MODALITY) {
    params.push(auth.subId);
    filters.push(`c.clt_subId = $${params.length}`);
  } else if (scope === SCOPE.ZONE) {
    params.push(auth.zone);
    filters.push(`c.clt_zone = $${params.length}`);
  } else if (scope === SCOPE.CLIENT || scope === SCOPE.CLIENT_MODALITY) {
    params.push(auth.clt_id);
    filters.push(`e.eqp_cltId = $${params.length}`);
  }
  if ((scope === SCOPE.SUBOFFICE_MODALITY || scope === SCOPE.CLIENT_MODALITY) && auth.modalities?.length) {
    params.push(auth.modalities);
    filters.push(`e.eqp_modalId = ANY($${params.length}::int[])`);
  }

  const r = await pool.query(
    `SELECT e.eqp_id, e.eqp_alias, e.eqp_model, e.eqp_serial, e.eqp_barcode,
            e.eqp_roomAlias AS "eqp_roomAlias", e.eqp_isActive AS "eqp_isActive",
            e.eqp_isContract AS "eqp_isContract",
            c.clt_name, cd.cltDept_alias AS dept_name,
            m.mod_name AS modal_name, mk.make_name
     FROM equipments e
     JOIN clients           c  ON c.clt_id      = e.eqp_cltId
     LEFT JOIN client_depts cd ON cd.cltDept_id = e.eqp_deptId
     LEFT JOIN modalities   m  ON m.mod_id      = e.eqp_modalId
     LEFT JOIN makes        mk ON mk.make_id    = e.eqp_makeId
     WHERE ${filters.join(' AND ')}
     ORDER BY c.clt_name, cd.cltDept_alias, e.eqp_alias`,
    params
  );
  return r.rows;
}

async function getEquipment(id) {
  const r = await pool.query(
    `SELECT e.eqp_id, e.eqp_alias, e.eqp_model, e.eqp_serial, e.eqp_barcode,
            e.eqp_roomAlias AS "eqp_roomAlias", e.eqp_isActive AS "eqp_isActive",
            e.eqp_isContract AS "eqp_isContract", e.eqp_cltId AS "eqp_cltId",
            e.eqp_deptId AS "eqp_deptId", e.eqp_modalId AS "eqp_modalId",
            e.eqp_makeId AS "eqp_makeId",
            c.clt_name, cd.cltDept_alias AS dept_name,
            m.mod_name AS modal_name, mk.make_name
     FROM equipments e
     JOIN clients           c  ON c.clt_id      = e.eqp_cltId
     LEFT JOIN client_depts cd ON cd.cltDept_id = e.eqp_deptId
     LEFT JOIN modalities   m  ON m.mod_id      = e.eqp_modalId
     LEFT JOIN makes        mk ON mk.make_id    = e.eqp_makeId
     WHERE e.eqp_id = $1`,
    [id]
  );
  return r.rows[0];
}

async function createEquipment(data) {
  const r = await pool.query(
    `INSERT INTO equipments
       (eqp_cltId, eqp_deptId, eqp_modalId, eqp_makeId,
        eqp_alias, eqp_model, eqp_serial, eqp_barcode,
        eqp_roomAlias, eqp_isContract, eqp_srvcBy)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING ${EQUIPMENT_COLS}`,
    [data.eqp_cltId, data.eqp_deptId, data.eqp_modalId, data.eqp_makeId,
     data.eqp_alias, data.eqp_model, data.eqp_serial, data.eqp_barcode,
     data.eqp_roomAlias, data.eqp_isContract || false, data.eqp_srvcBy || 1]
  );
  return r.rows[0];
}

async function updateEquipment(id, data) {
  const r = await pool.query(
    `UPDATE equipments
     SET eqp_deptId=$1, eqp_modalId=$2, eqp_makeId=$3,
         eqp_alias=$4, eqp_model=$5, eqp_serial=$6, eqp_barcode=$7,
         eqp_isActive=$8, eqp_roomAlias=$9, eqp_isContract=$10
     WHERE eqp_id=$11 RETURNING ${EQUIPMENT_COLS}`,
    [data.eqp_deptId, data.eqp_modalId, data.eqp_makeId,
     data.eqp_alias, data.eqp_model, data.eqp_serial, data.eqp_barcode,
     data.eqp_isActive !== false, data.eqp_roomAlias, data.eqp_isContract || false, id]
  );
  return r.rows[0];
}

async function listDepartments() {
  const r = await pool.query('SELECT dept_id, dept_name FROM departments ORDER BY dept_name');
  return r.rows;
}

async function listModalities() {
  const r = await pool.query('SELECT mod_id, mod_name FROM modalities ORDER BY mod_name');
  return r.rows;
}

async function listMakes() {
  const r = await pool.query('SELECT make_id, make_name FROM makes ORDER BY make_name');
  return r.rows;
}

module.exports = {
  listEquipment, getEquipment, createEquipment, updateEquipment,
  listDepartments, listModalities, listMakes,
};
