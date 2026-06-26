const pool = require('../db/pool');

async function getNotifications(cntId) {
  const res = await pool.query(
    `SELECT tn.tn_id AS "tn_item_ID", tn.tkt_id AS "tkt_ID",
            c.clt_name AS "tkt_clt_name",
            e.eqp_alias, e.eqp_model,
            t.tkt_shrt_desc, t.tkt_name, t.tkt_phone,
            tn.tn_item_start, tn.tn_item_status, tn.tn_item_usr, tn.tnif_stop,
            t.has_pics AS pics
     FROM ticket_notifications tn
     JOIN tickets   t ON t.tkt_id = tn.tkt_id
     JOIN clients   c ON c.clt_id = t.clt_id
     JOIN equipment e ON e.eqp_id = t.eqp_id
     WHERE tn.tn_item_usr = $1 AND tn.tnif_stop = FALSE
     ORDER BY c.clt_name, tn.tn_item_start`,
    [cntId]
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows.map(r => ({ ...r, tn_item_start: r.tn_item_start?.toISOString?.() ?? r.tn_item_start }));
}

async function replyNotification(answer, cntId, tktId, tnItemId) {
  if (answer === '1') {
    await pool.query('UPDATE tickets SET tkt_assigned = $1 WHERE tkt_id = $2', [cntId, tktId]);
  }
  await pool.query('UPDATE ticket_notifications SET tnif_stop = TRUE WHERE tn_id = $1', [tnItemId]);
  return [{ result: 'ok' }];
}

module.exports = { getNotifications, replyNotification };
