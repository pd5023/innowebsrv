const pool = require('../db/pool');

async function getHistory(emplId) {
  const res = await pool.query(
    `SELECT DISTINCT e.eqp_id AS "eqp_ID", e.eqp_alias, e.eqp_model,
            c.clt_name, cd.cltDept_alias AS dept_name, m.mod_name AS modal_name
     FROM SR sr
     JOIN tickets    t  ON t.tkt_id     = sr.sr_tktId
     JOIN clients    c  ON c.clt_id     = t.tkt_cltId
     JOIN equipments e  ON e.eqp_id     = t.tkt_eqpId
     JOIN client_depts cd ON cd.cltDept_id = e.eqp_deptId
     JOIN modalities   m  ON m.mod_id     = e.eqp_modalId
     WHERE t.tkt_assigned = $1
     ORDER BY c.clt_name, m.mod_name, cd.cltDept_alias, e.eqp_alias`,
    [emplId]
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows;
}

async function getEquipHistory(eqpId) {
  const res = await pool.query(
    `SELECT sr.sr_id, t.tkt_id AS "tkt_ID", t.tkt_date,
            t.tkt_shrtDesc AS "tkt_shrtDesc", sr.sr_date AS "sDate", sr.sr_desc AS "sDesc",
            t.tkt_status AS "tkt_type",
            emp.empl_name AS "NAME"
     FROM SR sr
     JOIN tickets  t   ON t.tkt_id   = sr.sr_tktId
     LEFT JOIN employees emp ON emp.empl_id = t.tkt_assigned
     WHERE t.tkt_eqpId = $1
     ORDER BY sr.sr_date DESC`,
    [eqpId]
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows;
}

async function getScanResult(barcode) {
  const res = await pool.query(
    `SELECT e.eqp_id, e.eqp_alias, e.eqp_model, e.eqp_barcode, e.eqp_serial,
            c.clt_name, cd.cltDept_alias AS dept_name,
            m.mod_name AS modal_name, mk.make_name
     FROM equipments  e
     JOIN clients      c  ON c.clt_id     = e.eqp_cltId
     JOIN client_depts cd ON cd.cltDept_id = e.eqp_deptId
     JOIN modalities   m  ON m.mod_id     = e.eqp_modalId
     JOIN makes        mk ON mk.make_id   = e.eqp_makeId
     WHERE e.eqp_barcode = $1`,
    [barcode]
  );
  if (res.rows.length === 0) return [{ result: 'notfound' }];
  return res.rows;
}

module.exports = { getHistory, getEquipHistory, getScanResult };
