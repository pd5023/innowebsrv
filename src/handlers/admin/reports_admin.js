const pool = require('../../db/pool');

async function listReports({ cltId, emplId, from, to } = {}) {
  const r = await pool.query(
    `SELECT sr.sr_id, sr.sr_date, sr.sr_desc, sr.sr_status,
            sr.sr_signName, sr.sr_hasPics,
            t.tkt_id, t.tkt_shrtDesc,
            c.clt_name, e.eqp_alias, e.eqp_model,
            ss.stat_name AS status_name
     FROM SR sr
     JOIN tickets    t  ON t.tkt_id  = sr.sr_tktId
     JOIN clients    c  ON c.clt_id  = t.tkt_cltId
     JOIN equipments e  ON e.eqp_id  = t.tkt_eqpId
     JOIN sr_status  ss ON ss.stat_id = sr.sr_status
     WHERE ($1::int  IS NULL OR c.clt_id   = $1)
       AND ($2::int  IS NULL OR t.tkt_assigned = $2)
       AND ($3::date IS NULL OR sr.sr_date >= $3)
       AND ($4::date IS NULL OR sr.sr_date <= $4)
     ORDER BY sr.sr_date DESC`,
    [cltId ?? null, emplId ?? null, from ?? null, to ?? null]
  );
  return r.rows.map(r => ({ ...r, sr_date: r.sr_date?.toISOString?.() ?? r.sr_date }));
}

async function getReport(id) {
  const sr = await pool.query('SELECT * FROM SR WHERE sr_id = $1', [id]);
  if (!sr.rows.length) return null;
  const pics  = await pool.query('SELECT srPics_id, srPics_date FROM SR_pics WHERE srPics_srId = $1', [id]);
  const parts = await pool.query('SELECT * FROM parts WHERE part_srId = $1', [id]);
  return { ...sr.rows[0], pics: pics.rows, parts: parts.rows };
}

module.exports = { listReports, getReport };
