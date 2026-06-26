const pool = require('../db/pool');

async function getTickets(zone, cntId, laborTypeId) {
  const res = await pool.query(
    `SELECT t.tkt_id AS "tkt_ID", t.tkt_date, t.tkt_shrt_desc, t.tkt_desc,
            t.tkt_name, t.tkt_email, t.tkt_phone, t.tkt_po AS "tkt_PO",
            t.tkt_assigned, t.has_pics AS pics,
            c.clt_name, e.eqp_id AS "eqp_ID", e.eqp_alias, e.eqp_model,
            e.modal_id AS "eqp_modal", con.name AS name
     FROM tickets t
     JOIN clients   c   ON c.clt_id  = t.clt_id
     JOIN equipment e   ON e.eqp_id  = t.eqp_id
     LEFT JOIN contacts con ON con.cnt_id = t.tkt_assigned
     WHERE t.tkt_status = 0
       AND ($1::int IS NULL OR c.clt_zone = $1)
       AND ($2::int IS NULL OR t.labor_type_id = $2)
     ORDER BY t.tkt_date ASC`,
    [zone || null, laborTypeId || null]
  );

  const notifRes = await pool.query(
    `SELECT COUNT(*) AS cnt FROM ticket_notifications WHERE tn_item_usr = $1 AND tnif_stop = FALSE`,
    [cntId]
  );

  const rows = res.rows.map(r => ({
    ...r,
    tkt_date: r.tkt_date?.toISOString?.() ?? r.tkt_date,
    pics: parseInt(r.pics ?? 0),
  }));

  if (rows.length === 0) rows.push({ result: 'norecords' });
  rows.push({ notif: `${notifRes.rows[0].cnt}|0` });
  return rows;
}

async function getTicketPics(tktId) {
  const res = await pool.query(
    'SELECT pic_data, pic_title FROM ticket_pics WHERE tkt_id = $1',
    [tktId]
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows.map(r => [r.pic_data, r.pic_title]);
}

async function createTicket(eqpId, laborTypeId, desc, assignedCntId) {
  const eqp = await pool.query('SELECT clt_id FROM equipment WHERE eqp_id = $1', [eqpId]);
  if (eqp.rows.length === 0) return { error: 'equipment not found' };

  const res = await pool.query(
    `INSERT INTO tickets (clt_id, eqp_id, labor_type_id, tkt_shrt_desc, tkt_assigned, tkt_status)
     VALUES ($1, $2, $3, $4, $5, 0) RETURNING tkt_id`,
    [eqp.rows[0].clt_id, eqpId, laborTypeId || null, desc, assignedCntId || null]
  );
  return [{ tkt_id: res.rows[0].tkt_id }];
}

async function getVoidedTickets(cntId) {
  const res = await pool.query(
    `SELECT t.tkt_id AS "tkt_ID", t.tkt_date, t.tkt_shrt_desc,
            c.clt_name, d.dept_name, m.modal_name, e.eqp_alias
     FROM tickets t
     JOIN clients    c ON c.clt_id  = t.clt_id
     JOIN equipment  e ON e.eqp_id  = t.eqp_id
     JOIN departments d ON d.dept_id = e.dept_id
     JOIN modalities  m ON m.modal_id = e.modal_id
     WHERE t.tkt_status = 9
     ORDER BY c.clt_name, d.dept_name, m.modal_name`,
    []
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows.map(r => ({ ...r, tkt_date: r.tkt_date?.toISOString?.() ?? r.tkt_date }));
}

module.exports = { getTickets, getTicketPics, createTicket, getVoidedTickets };
