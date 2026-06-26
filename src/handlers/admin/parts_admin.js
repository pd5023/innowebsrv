const pool = require('../../db/pool');

async function listParts({ cltId, status } = {}) {
  const r = await pool.query(
    `SELECT p.part_id, p.part_desc, p.part_numb, p.part_qty, p.part_price,
            p.order_status, p.date_req, p.changed, p.diff,
            t.tkt_id, c.clt_name, e.eqp_alias
     FROM parts p
     JOIN tickets   t ON t.tkt_id = p.tkt_id
     JOIN clients   c ON c.clt_id = t.clt_id
     JOIN equipment e ON e.eqp_id = t.eqp_id
     WHERE ($1::int IS NULL    OR c.clt_id = $1)
       AND ($2::varchar IS NULL OR p.order_status = $2)
     ORDER BY p.date_req DESC`,
    [cltId ?? null, status ?? null]
  );
  return r.rows.map(r => ({ ...r, date_req: r.date_req?.toISOString?.() ?? r.date_req }));
}

async function updatePartStatus(partId, status, oDesc, oNumber, oQty) {
  const r = await pool.query(
    `UPDATE parts SET order_status=$1, o_desc=$2, o_number=$3, o_qty=$4, changed=TRUE
     WHERE part_id=$5 RETURNING *`,
    [status, oDesc, oNumber, oQty, partId]
  );
  return r.rows[0];
}

module.exports = { listParts, updatePartStatus };
