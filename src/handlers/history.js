const pool = require('../db/pool');

async function getHistory(cntId, catId, zone) {
  const res = await pool.query(
    `SELECT DISTINCT e.eqp_id AS "eqp_ID", e.eqp_alias, e.eqp_model,
            c.clt_name, d.dept_name, m.modal_name
     FROM service_reports sr
     JOIN tickets   t  ON t.tkt_id  = sr.tkt_id
     JOIN clients   c  ON c.clt_id  = t.clt_id
     JOIN equipment e  ON e.eqp_id  = t.eqp_id
     JOIN departments d ON d.dept_id = e.dept_id
     JOIN modalities  m ON m.modal_id = e.modal_id
     WHERE sr.cnt_id = $1
     ORDER BY c.clt_name, m.modal_name, d.dept_name, e.eqp_alias`,
    [cntId]
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows;
}

async function getEquipHistory(eqpId) {
  const res = await pool.query(
    `SELECT sr.sr_id, t.tkt_id AS "tkt_ID", t.tkt_date, t.tkt_shrt_desc,
            con.name AS "NAME", sr.sr_date AS "sDate", sr.sr_repairs AS "sDesc",
            t.tkt_status AS "tkt_type"
     FROM service_reports sr
     JOIN tickets  t   ON t.tkt_id  = sr.tkt_id
     JOIN contacts con ON con.cnt_id = sr.cnt_id
     WHERE t.eqp_id = $1
     ORDER BY sr.sr_date DESC`,
    [eqpId]
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows;
}

async function getScanResult(barcode) {
  const res = await pool.query(
    `SELECT e.eqp_id, e.eqp_alias, e.eqp_model, e.eqp_barcode, e.eqp_serial,
            c.clt_name, d.dept_name, m.modal_name, mk.make_name
     FROM equipment e
     JOIN clients     c  ON c.clt_id  = e.clt_id
     JOIN departments d  ON d.dept_id = e.dept_id
     JOIN modalities  m  ON m.modal_id = e.modal_id
     JOIN makes       mk ON mk.make_id = e.make_id
     WHERE e.eqp_barcode = $1`,
    [barcode]
  );
  if (res.rows.length === 0) return [{ result: 'notfound' }];
  return res.rows;
}

module.exports = { getHistory, getEquipHistory, getScanResult };
