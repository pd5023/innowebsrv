const pool = require('../../db/pool');

async function listParts({ cltId, statusId } = {}) {
  const r = await pool.query(
    `SELECT p.part_id, p.part_name, p.part_num, p.part_price,
            p.part_status, p.part_dateOrder, p.part_dateReceive,
            ps.partStat_name AS status_name,
            t.tkt_id, c.clt_name, e.eqp_alias,
            v.vend_name AS vendor_name
     FROM parts p
     JOIN tickets     t   ON t.tkt_id      = p.part_tktId
     JOIN clients     c   ON c.clt_id      = t.tkt_cltId
     JOIN equipments  e   ON e.eqp_id      = t.tkt_eqpId
     JOIN part_status ps  ON ps.partStat_id = p.part_status
     LEFT JOIN vendors v  ON v.vend_id     = p.part_vendor
     WHERE ($1::int IS NULL OR c.clt_id     = $1)
       AND ($2::int IS NULL OR p.part_status = $2)
     ORDER BY p.part_dateOrder DESC`,
    [cltId ?? null, statusId ?? null]
  );
  return r.rows.map(r => ({
    ...r,
    part_dateOrder:   r.part_dateorder?.toISOString?.()   ?? r.part_dateorder,
    part_dateReceive: r.part_datereceive?.toISOString?.() ?? r.part_datereceive,
  }));
}

async function updatePartStatus(partId, statusId, receiveDate) {
  const r = await pool.query(
    `UPDATE parts SET part_status=$1, part_dateReceive=$2
     WHERE part_id=$3 RETURNING *`,
    [statusId, receiveDate || null, partId]
  );
  return r.rows[0];
}

module.exports = { listParts, updatePartStatus };
