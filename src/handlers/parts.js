const pool = require('../db/pool');

async function getPartOrders(cntId) {
  const res = await pool.query(
    `SELECT p.part_desc AS "Desc", p.part_numb AS "Number", p.part_qty AS "Qty",
            p.date_req AS "Date", p.o_desc AS "oDesc", p.o_number AS "oNumber",
            p.o_qty AS "oQty", p.changed AS "Changed", p.diff AS "Diff",
            p.order_status AS "GroupName"
     FROM parts p
     JOIN tickets t ON t.tkt_id = p.tkt_id
     WHERE t.tkt_assigned = $1 AND p.order_status IS NOT NULL
     ORDER BY p.order_status, p.date_req DESC`,
    [cntId]
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows.map(r => ({
    ...r,
    Date: r.Date?.toISOString?.() ?? r.Date,
    Changed: r.Changed ? 1 : 0,
  }));
}

module.exports = { getPartOrders };
