const pool = require('../../db/pool');

async function listTickets({ status, cltId, assigned } = {}) {
  const r = await pool.query(
    `SELECT t.tkt_id, t.tkt_date, t.tkt_shrtDesc, t.tkt_status,
            c.clt_name, e.eqp_alias, e.eqp_model,
            emp.empl_name AS assigned_name,
            ts.tkt_statName AS status_name,
            t.tkt_hasPics
     FROM tickets t
     JOIN clients    c   ON c.clt_id   = t.tkt_cltId
     JOIN equipments e   ON e.eqp_id   = t.tkt_eqpId
     LEFT JOIN employees  emp ON emp.empl_id = t.tkt_assigned
     LEFT JOIN tkt_status ts  ON ts.tkt_statId = t.tkt_status
     WHERE ($1::int IS NULL OR t.tkt_status  = $1)
       AND ($2::int IS NULL OR t.tkt_cltId   = $2)
       AND ($3::int IS NULL OR t.tkt_assigned = $3)
     ORDER BY t.tkt_date DESC`,
    [status ?? null, cltId ?? null, assigned ?? null]
  );
  return r.rows.map(r => ({ ...r, tkt_date: r.tkt_date?.toISOString?.() ?? r.tkt_date }));
}

async function assignTicket(tktId, emplId) {
  const r = await pool.query(
    'UPDATE tickets SET tkt_assigned=$1, tkt_status=2 WHERE tkt_id=$2 RETURNING tkt_id',
    [emplId, tktId]
  );
  return r.rows[0];
}

async function voidTicket(tktId) {
  await pool.query('UPDATE tickets SET tkt_status=5, tkt_cancelDate=NOW() WHERE tkt_id=$1', [tktId]);
  return { ok: true };
}

module.exports = { listTickets, assignTicket, voidTicket };
