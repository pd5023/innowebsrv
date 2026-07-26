const pool = require('../../db/pool');

async function listEquipment(cltId) {
  const r = await pool.query(
    `SELECT e.eqp_id, e.eqp_alias, e.eqp_model, e.eqp_serial, e.eqp_barcode,
            e.eqp_roomAlias, e.eqp_isActive, e.eqp_isContract,
            c.clt_name, cd.cltDept_alias AS dept_name,
            m.mod_name AS modal_name, mk.make_name
     FROM equipments e
     JOIN clients      c  ON c.clt_id     = e.eqp_cltId
     JOIN client_depts cd ON cd.cltDept_id = e.eqp_deptId
     JOIN modalities   m  ON m.mod_id     = e.eqp_modalId
     JOIN makes        mk ON mk.make_id   = e.eqp_makeId
     WHERE ($1::int IS NULL OR e.eqp_cltId = $1)
     ORDER BY c.clt_name, cd.cltDept_alias, e.eqp_alias`,
    [cltId || null]
  );
  return r.rows;
}

async function createEquipment(data) {
  const r = await pool.query(
    `INSERT INTO equipments
       (eqp_cltId, eqp_deptId, eqp_modalId, eqp_makeId,
        eqp_alias, eqp_model, eqp_serial, eqp_barcode,
        eqp_roomAlias, eqp_isContract, eqp_srvcBy)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
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
     WHERE eqp_id=$11 RETURNING *`,
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

async function listClientDepts(cltId) {
  const r = await pool.query(
    `SELECT cd.cltDept_id, cd.cltDept_alias, d.dept_name
     FROM client_depts cd
     JOIN departments d ON d.dept_id = cd.cltDept_dept
     WHERE cd.cltDept_cltId = $1
     ORDER BY cd.cltDept_alias`,
    [cltId]
  );
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
  listEquipment, createEquipment, updateEquipment,
  listDepartments, listClientDepts, listModalities, listMakes,
};
