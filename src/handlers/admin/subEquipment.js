const pool = require('../../db/pool');

const SUBEQP_COLS = `subeqp_id, subeqp_eqpId AS "subeqp_eqpId", subeqp_makeId AS "subeqp_makeId",
  subeqp_model, subeqp_serial, subeqp_barcode, subeqp_isActive AS "subeqp_isActive",
  subeqp_srvcBy AS "subeqp_srvcBy", subeqp_vendor, subeqp_isContract AS "subeqp_isContract"`;

async function listSubEquipment(eqpId) {
  const r = await pool.query(
    `SELECT se.subeqp_id, se.subeqp_eqpId AS "subeqp_eqpId", se.subeqp_makeId AS "subeqp_makeId",
            se.subeqp_model, se.subeqp_serial, se.subeqp_barcode,
            se.subeqp_isActive AS "subeqp_isActive", se.subeqp_isContract AS "subeqp_isContract",
            mk.make_name
     FROM sub_equipment se
     LEFT JOIN makes mk ON mk.make_id = se.subeqp_makeId
     WHERE se.subeqp_eqpId = $1
     ORDER BY se.subeqp_model`,
    [eqpId]
  );
  return r.rows;
}

async function createSubEquipment(data) {
  const r = await pool.query(
    `INSERT INTO sub_equipment
       (subeqp_eqpId, subeqp_makeId, subeqp_model, subeqp_serial, subeqp_barcode, subeqp_isActive, subeqp_isContract)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${SUBEQP_COLS}`,
    [data.subeqp_eqpId, data.subeqp_makeId || null, data.subeqp_model, data.subeqp_serial,
     data.subeqp_barcode, data.subeqp_isActive !== false, data.subeqp_isContract || false]
  );
  return r.rows[0];
}

async function updateSubEquipment(id, data) {
  const r = await pool.query(
    `UPDATE sub_equipment
     SET subeqp_makeId=$1, subeqp_model=$2, subeqp_serial=$3, subeqp_barcode=$4,
         subeqp_isActive=$5, subeqp_isContract=$6
     WHERE subeqp_id=$7 RETURNING ${SUBEQP_COLS}`,
    [data.subeqp_makeId || null, data.subeqp_model, data.subeqp_serial, data.subeqp_barcode,
     data.subeqp_isActive !== false, data.subeqp_isContract || false, id]
  );
  return r.rows[0];
}

async function deleteSubEquipment(id) {
  await pool.query('DELETE FROM sub_equipment WHERE subeqp_id = $1', [id]);
  return { deleted: true };
}

module.exports = { listSubEquipment, createSubEquipment, updateSubEquipment, deleteSubEquipment };
