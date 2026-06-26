const pool = require('../../db/pool');

async function listTickets({ status, cltId, assigned } = {}) {
  const r = await pool.query(
    `SELECT t.tkt_id, t.tkt_date, t.tkt_shrt_desc, t.tkt_status,
            c.clt_name, e.eqp_alias, e.eqp_model,
            con.name AS assigned_name, lt.name AS labor_type,
            t.has_pics
     FROM tickets t
     JOIN clients   c   ON c.clt_id  = t.clt_id
     JOIN equipment e   ON e.eqp_id  = t.eqp_id
     LEFT JOIN contacts con ON con.cnt_id = t.tkt_assigned
     LEFT JOIN labor_types lt ON lt.lt_id = t.labor_type_id
     WHERE ($1::int IS NULL OR t.tkt_status = $1)
       AND ($2::int IS NULL OR t.clt_id     = $2)
       AND ($3::int IS NULL OR t.tkt_assigned = $3)
     ORDER BY t.tkt_date DESC`,
    [status ?? null, cltId ?? null, assigned ?? null]
  );
  return r.rows.map(r => ({ ...r, tkt_date: r.tkt_date?.toISOString?.() ?? r.tkt_date }));
}

async function assignTicket(tktId, cntId) {
  const r = await pool.query(
    'UPDATE tickets SET tkt_assigned=$1 WHERE tkt_id=$2 RETURNING tkt_id',
    [cntId, tktId]
  );
  return r.rows[0];
}

async function voidTicket(tktId, reason) {
  await pool.query('UPDATE tickets SET tkt_status=9 WHERE tkt_id=$1', [tktId]);
  return { ok: true };
}

async function sendNotification(tktId, cntId, message) {
  const r = await pool.query(
    `INSERT INTO ticket_notifications (tkt_id, tn_item_usr, tn_item_status)
     VALUES ($1, $2, $3) RETURNING tn_id`,
    [tktId, cntId, message || 'pending']
  );
  return r.rows[0];
}

module.exports = { listTickets, assignTicket, voidTicket, sendNotification };
