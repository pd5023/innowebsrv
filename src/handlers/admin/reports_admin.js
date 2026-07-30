const pool = require('../../db/pool');

// Postgres folds unquoted mixed-case identifiers to lowercase, so SELECT * / RETURNING *
// on columns like sr_signName comes back as `sr_signname`, breaking JS code that expects
// `sr_signName`. Alias every mixed-case column explicitly so the driver returns the exact
// key we expect.
const SR_COLS = `sr_id, sr_tktId AS "sr_tktId", sr_eqpId AS "sr_eqpId",
  sr_subEqpId AS "sr_subEqpId", sr_date, sr_shrtDesc AS "sr_shrtDesc", sr_desc,
  sr_status, sr_hrs, sr_hasPics AS "sr_hasPics", sr_sign, sr_signName AS "sr_signName"`;

const PARTS_COLS = `part_id, part_tktId AS "part_tktId", part_srId AS "part_srId",
  part_dateOrder AS "part_dateOrder", part_dateReceive AS "part_dateReceive",
  part_name, part_num, part_vendor, part_price, part_status`;

async function listReports({ cltId, emplId, from, to } = {}) {
  const r = await pool.query(
    `SELECT sr.sr_id, sr.sr_date, sr.sr_desc, sr.sr_status,
            sr.sr_signName AS "sr_signName", sr.sr_hasPics AS "sr_hasPics",
            t.tkt_id, t.tkt_shrtDesc AS "tkt_shrtDesc",
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
  const sr = await pool.query(`SELECT ${SR_COLS} FROM SR WHERE sr_id = $1`, [id]);
  if (!sr.rows.length) return null;
  const pics  = await pool.query(
    `SELECT srPics_id AS "srPics_id", srPics_date AS "srPics_date"
     FROM SR_pics WHERE srPics_srId = $1`,
    [id]
  );
  const parts = await pool.query(`SELECT ${PARTS_COLS} FROM parts WHERE part_srId = $1`, [id]);
  return { ...sr.rows[0], pics: pics.rows, parts: parts.rows };
}

module.exports = { listReports, getReport };
