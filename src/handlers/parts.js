const pool = require('../db/pool');

async function getPartOrders(emplId) {
  const res = await pool.query(
    `SELECT p.part_id, p.part_name AS "Desc", p.part_num AS "Number",
            p.part_price AS "Price", p.part_dateOrder AS "Date",
            p.part_status AS "StatusId", ps.partStat_name AS "GroupName",
            p.part_tktId AS "part_tktId"
     FROM parts p
     JOIN tickets    t  ON t.tkt_id      = p.part_tktId
     JOIN part_status ps ON ps.partStat_id = p.part_status
     WHERE t.tkt_assigned = $1
     ORDER BY p.part_status, p.part_dateOrder DESC`,
    [emplId]
  );
  if (res.rows.length === 0) return [{ result: 'norecords' }];
  return res.rows.map(r => ({
    ...r,
    Date: r.Date?.toISOString?.() ?? r.Date,
  }));
}

module.exports = { getPartOrders };
