const pool = require('../db/pool');

async function getTCToday(cntId) {
  const today = new Date().toISOString().split('T')[0];
  const res = await pool.query(
    'SELECT te_name AS name, te_type AS type, time_in, time_out FROM time_entries WHERE cnt_id = $1 AND te_date = $2 ORDER BY time_in',
    [cntId, today]
  );
  return res.rows.length > 0 ? res.rows : [{ result: 'norecords' }];
}

async function updateTC(cntId, step) {
  const today = new Date().toISOString().split('T')[0];
  const now = Date.now();
  const existing = await pool.query(
    'SELECT te_id, time_out FROM time_entries WHERE cnt_id = $1 AND te_date = $2 AND te_name = $3 ORDER BY te_id DESC LIMIT 1',
    [cntId, today, step]
  );
  if (existing.rows.length > 0 && !existing.rows[0].time_out) {
    await pool.query('UPDATE time_entries SET time_out = $1 WHERE te_id = $2', [now, existing.rows[0].te_id]);
  } else {
    await pool.query('INSERT INTO time_entries (cnt_id, te_date, te_name, time_in) VALUES ($1,$2,$3,$4)', [cntId, today, step, now]);
  }
  return [{ result: 'ok' }];
}

async function getTCPeriod(cntId) {
  const res = await pool.query(
    `SELECT te_date AS date, te_name AS name, time_in, time_out
     FROM time_entries WHERE cnt_id = $1
       AND te_date >= date_trunc('week', CURRENT_DATE) - INTERVAL '7 days'
     ORDER BY te_date, time_in`,
    [cntId]
  );
  return res.rows.length > 0 ? res.rows : [{ result: 'norecords' }];
}

module.exports = { getTCToday, updateTC, getTCPeriod };
