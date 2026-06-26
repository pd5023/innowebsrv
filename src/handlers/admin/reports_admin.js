const pool = require('../../db/pool');

async function listReports({ cltId, cntId, from, to } = {}) {
  const r = await pool.query(
    `SELECT sr.sr_id, sr.sr_date, sr.sr_repairs, sr.sr_complete, sr.sr_sign_name,
            t.tkt_id, t.tkt_shrt_desc,
            c.clt_name, e.eqp_alias, e.eqp_model,
            con.name AS engineer_name
     FROM service_reports sr
     JOIN tickets  t   ON t.tkt_id  = sr.tkt_id
     JOIN clients  c   ON c.clt_id  = t.clt_id
     JOIN equipment e  ON e.eqp_id  = t.eqp_id
     JOIN contacts con ON con.cnt_id = sr.cnt_id
     WHERE ($1::int IS NULL  OR c.clt_id   = $1)
       AND ($2::int IS NULL  OR sr.cnt_id  = $2)
       AND ($3::date IS NULL OR sr.sr_date >= $3)
       AND ($4::date IS NULL OR sr.sr_date <= $4)
     ORDER BY sr.sr_date DESC`,
    [cltId ?? null, cntId ?? null, from ?? null, to ?? null]
  );
  return r.rows.map(r => ({ ...r, sr_date: r.sr_date?.toISOString?.() ?? r.sr_date }));
}

async function getReport(id) {
  const r = await pool.query('SELECT * FROM service_reports WHERE sr_id = $1', [id]);
  if (!r.rows.length) return null;
  const hours  = await pool.query('SELECT * FROM sr_hours  WHERE sr_id = $1', [id]);
  const eparts = await pool.query('SELECT * FROM sr_parts  WHERE sr_id = $1', [id]);
  const equips = await pool.query('SELECT * FROM sr_equips WHERE sr_id = $1', [id]);
  return { ...r.rows[0], hours: hours.rows, parts: eparts.rows, equips: equips.rows };
}

module.exports = { listReports, getReport };
