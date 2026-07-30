const pool = require('../db/pool');

async function getTickets(zone, emplId, laborTypeId) {
  const res = await pool.query(
    `SELECT t.tkt_id AS "tkt_ID", t.tkt_date, t.tkt_shrtDesc AS "tkt_shrtDesc", t.tkt_desc,
            t.tkt_po AS "tkt_PO", t.tkt_assigned, t.tkt_hasPics AS pics,
            c.clt_name,
            e.eqp_id AS "eqp_ID", e.eqp_alias, e.eqp_model,
            e.eqp_modalId AS "eqp_modal",
            emp.empl_name AS name
     FROM tickets t
     JOIN clients    c   ON c.clt_id    = t.tkt_cltId
     JOIN equipments e   ON e.eqp_id    = t.tkt_eqpId
     LEFT JOIN employees emp ON emp.empl_id = t.tkt_assigned
     WHERE t.tkt_status IN (1,2,3)
       AND ($1::int IS NULL OR c.clt_zone     = $1)
       AND ($2::int IS NULL OR t.tkt_laborTypeId = $2)
     ORDER BY t.tkt_date ASC`,
    [zone || null, laborTypeId || null]
  );

  const rows = res.rows.map(r => ({
    ...r,
    tkt_date: r.tkt_date?.toISOString?.() ?? r.tkt_date,
    pics: r.pics ? 1 : 0,
  }));

  if (rows.length === 0) rows.push({ result: 'norecords' });
  rows.push({ notif: '0|0' });
  return rows;
}

async function createTicket(eqpId, laborTypeId, desc, assignedEmplId) {
  const eqp = await pool.query('SELECT eqp_cltId FROM equipments WHERE eqp_id = $1', [eqpId]);
  if (eqp.rows.length === 0) return { error: 'equipment not found' };

  const res = await pool.query(
    `INSERT INTO tickets
       (tkt_cltId, tkt_eqpId, tkt_laborTypeId, tkt_shrtDesc, tkt_assigned, tkt_status)
     VALUES ($1,$2,$3,$4,$5,1) RETURNING tkt_id`,
    [eqp.rows[0].eqp_cltid, eqpId, laborTypeId || null, desc, assignedEmplId || null]
  );
  return [{ tkt_id: res.rows[0].tkt_id }];
}

async function getVoidedTickets() {
  const res = await pool.query(
    `SELECT t.tkt_id AS "tkt_ID", t.tkt_date, t.tkt_shrtDesc AS "tkt_shrtDesc",
            c.clt_name, cd.cltDept_alias AS dept_name,
            m.mod_name AS modal_name, e.eqp_alias
     FROM tickets t
     JOIN clients      c  ON c.clt_id     = t.tkt_cltId
     JOIN equipments   e  ON e.eqp_id     = t.tkt_eqpId
     JOIN client_depts cd ON cd.cltDept_id = e.eqp_deptId
     JOIN modalities   m  ON m.mod_id     = e.eqp_modalId
     WHERE t.tkt_status = 5
     ORDER BY c.clt_name, cd.cltDept_alias, m.mod_name`
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows.map(r => ({ ...r, tkt_date: r.tkt_date?.toISOString?.() ?? r.tkt_date }));
}

module.exports = { getTickets, createTicket, getVoidedTickets };
