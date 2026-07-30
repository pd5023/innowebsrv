const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

// Postgres folds unquoted mixed-case identifiers to lowercase, so SELECT * / RETURNING *
// on columns like clt_busHrs comes back as `clt_bushrs`, breaking JS code that expects
// `clt_busHrs`. Alias every mixed-case column explicitly so the driver returns the exact
// key we expect.
const CLIENT_COLS = `clt_id, clt_name, clt_address, clt_phone, clt_800,
  clt_busHrs AS "clt_busHrs", clt_siteurl, clt_zone,
  clt_subId AS "clt_subId", pref_hrtick,
  pref_allowSRbill AS "pref_allowSRbill",
  pref_flexSRtime AS "pref_flexSRtime",
  pref_reqGeoLoc AS "pref_reqGeoLoc",
  pref_reqSign AS "pref_reqSign"`;

async function handleLogin(username, password) {
  const userRes = await pool.query(
    `SELECT empl_id, empl_name, empl_email, empl_phone, empl_password,
            empl_clientPrim, empl_role, empl_isActive
     FROM employees
     WHERE LOWER(empl_username) = LOWER($1) AND empl_isActive = TRUE`,
    [username]
  );

  if (userRes.rows.length === 0) return [{ error: 'noaccess' }];

  const user = userRes.rows[0];
  const match = await bcrypt.compare(password, user.empl_password);
  if (!match) return [{ error: 'noaccess' }];

  // Parse first client ID from empl_clientPrim (stored as "1" or "1,2,3")
  const cltId = parseInt((user.empl_clientprim ?? '').replace(/\D/g, '')) || null;

  const [clientRes, laborRes, partOrigRes, partStatRes, tktStatRes, srStatRes] = await Promise.all([
    cltId
      ? pool.query(`SELECT ${CLIENT_COLS} FROM clients WHERE clt_id = $1`, [cltId])
      : Promise.resolve({ rows: [{}] }),
    pool.query('SELECT rate_id AS id, rate_effDate AS "rate_effDate", rate_detail FROM labor_rates ORDER BY rate_effDate DESC LIMIT 1'),
    pool.query('SELECT partFrom_id AS id, partFrom_name AS name FROM part_origin ORDER BY partFrom_name'),
    pool.query('SELECT partStat_id AS id, partStat_name AS name FROM part_status ORDER BY partStat_id'),
    pool.query('SELECT tkt_statId AS id, tkt_statName AS name FROM tkt_status ORDER BY tkt_statId'),
    pool.query('SELECT stat_id AS id, stat_name AS name FROM sr_status ORDER BY stat_id'),
  ]);

  const client = clientRes.rows[0] ?? {};

  return [
    {
      id:        user.empl_id,
      name:      user.empl_name,
      email_to:  user.empl_email,
      mobile:    user.empl_phone,
      zone:      client.clt_zone ?? 1,
      clt_id:    cltId,
      auth_role: user.empl_role || 'staff',
      1: {
        clt_name:         client.clt_name ?? '',
        clt_main_nb:      client.clt_phone ?? '',
        clt_main800:      client.clt_800 ?? '',
        clt_busHrs:       client.clt_busHrs ?? '',
        pref_hrtick:      client.pref_hrtick ?? 15,
        pref_allowSRbill: client.pref_allowSRbill ? '1' : '0',
        pref_flexSRtime:  client.pref_flexSRtime  ? '1' : '0',
        pref_reqGeoLoc:   client.pref_reqGeoLoc   ? '1' : '0',
      },
      3: laborRes.rows,
      4: partOrigRes.rows,
      5: partStatRes.rows,
      6: tktStatRes.rows,
      7: srStatRes.rows,
    },
    { notif: '0|0' },
  ];
}

module.exports = { handleLogin };
