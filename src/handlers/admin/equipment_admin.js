const pool = require('../../db/pool');

async function listEquipment(cltId) {
  const r = await pool.query(
    `SELECT e.eqp_id, e.eqp_alias, e.eqp_model, e.eqp_serial, e.eqp_barcode, e.is_active,
            c.clt_name, d.dept_name, m.modal_name, mk.make_name
     FROM equipment e
     JOIN clients     c  ON c.clt_id   = e.clt_id
     JOIN departments d  ON d.dept_id  = e.dept_id
     JOIN modalities  m  ON m.modal_id = e.modal_id
     JOIN makes       mk ON mk.make_id = e.make_id
     WHERE ($1::int IS NULL OR e.clt_id = $1)
     ORDER BY c.clt_name, d.dept_name, e.eqp_alias`,
    [cltId || null]
  );
  return r.rows;
}

async function createEquipment(data) {
  const r = await pool.query(
    `INSERT INTO equipment (clt_id, dept_id, modal_id, make_id, eqp_alias, eqp_model, eqp_serial, eqp_barcode)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.clt_id, data.dept_id, data.modal_id, data.make_id,
     data.eqp_alias, data.eqp_model, data.eqp_serial, data.eqp_barcode]
  );
  return r.rows[0];
}

async function updateEquipment(id, data) {
  const r = await pool.query(
    `UPDATE equipment SET dept_id=$1, modal_id=$2, make_id=$3, eqp_alias=$4,
     eqp_model=$5, eqp_serial=$6, eqp_barcode=$7, is_active=$8
     WHERE eqp_id=$9 RETURNING *`,
    [data.dept_id, data.modal_id, data.make_id, data.eqp_alias,
     data.eqp_model, data.eqp_serial, data.eqp_barcode, data.is_active !== false, id]
  );
  return r.rows[0];
}

async function listDepartments() {
  const r = await pool.query('SELECT dept_id, dept_name FROM departments ORDER BY dept_name');
  return r.rows;
}
async function listModalities() {
  const r = await pool.query('SELECT modal_id, modal_name FROM modalities ORDER BY modal_name');
  return r.rows;
}
async function listMakes() {
  const r = await pool.query('SELECT make_id, make_name FROM makes ORDER BY make_name');
  return r.rows;
}

module.exports = { listEquipment, createEquipment, updateEquipment, listDepartments, listModalities, listMakes };
