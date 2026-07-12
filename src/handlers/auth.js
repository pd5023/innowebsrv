const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

async function handleLogin(username, password) {
  const userRes = await pool.query(
    `SELECT c.cnt_id, c.name, c.password, c.email, c.mobile,
            c.zone_id, c.cat_id, c.clt_id, c.cnt_role,
            cl.clt_name, cl.clt_main_nb, cl.clt_main800, cl.clt_busHrs,
            cl.clt_lang, cl.clt_tc_lunch,
            cl.pref_hrtick, cl.pref_allowSRbill, cl.pref_flexSRtime, cl.pref_reqGeoLoc
     FROM contacts c
     JOIN clients cl ON cl.clt_id = c.clt_id
     WHERE c.username = $1 AND c.is_active = TRUE`,
    [username]
  );

  if (userRes.rows.length === 0) return [{ error: 'noaccess' }];

  const user = userRes.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return [{ error: 'noaccess' }];

  const [laborTypes, partTypes, partOrigins, fees, tcTypes, notifRes] = await Promise.all([
    pool.query('SELECT lt_id AS id, name FROM labor_types WHERE clt_id = $1 AND (cat_id = $2 OR cat_id IS NULL)', [user.clt_id, user.cat_id]),
    pool.query('SELECT pt_id AS id, name FROM part_types WHERE clt_id = $1', [user.clt_id]),
    pool.query('SELECT po_id AS id, name FROM part_origins WHERE clt_id = $1', [user.clt_id]),
    pool.query('SELECT fee_id AS id, name, rate, link FROM fees WHERE clt_id = $1 AND (cat_id = $2 OR cat_id IS NULL)', [user.clt_id, user.cat_id]),
    pool.query('SELECT tct_id AS id, name FROM tc_types WHERE clt_id = $1', [user.clt_id]),
    pool.query('SELECT COUNT(*) AS cnt FROM ticket_notifications WHERE tn_item_usr = $1 AND tnif_stop = FALSE', [user.cnt_id]),
    pool.query('SELECT COUNT(*) AS cnt FROM parts WHERE tkt_id IN (SELECT tkt_id FROM tickets WHERE tkt_assigned = $1) AND order_status = $2', [user.cnt_id, 'Received']),
  ]);

  const notifCount = parseInt(notifRes[0]?.rows[0]?.cnt ?? 0);
  const partNotif = 0;

  return [
    {
      id:       user.cnt_id,
      name:     user.name,
      email_to: user.email,
      mobile:   user.mobile,
      zone:     user.zone_id,
      clt_id:   user.clt_id,
      auth_role: user.cnt_role || 'staff',
      catid:    user.cat_id,
      1: {
        clt_name:         user.clt_name,
        clt_main_nb:      user.clt_main_nb,
        clt_main800:      user.clt_main800,
        clt_busHrs:       user.clt_busHrs,
        clt_lang:         user.clt_lang,
        clt_tc_lunch:     user.clt_tc_lunch,
        pref_hrtick:      user.pref_hrtick,
        pref_allowSRbill: user.pref_allowSRbill ? '1' : '0',
        pref_flexSRtime:  user.pref_flexSRtime  ? '1' : '0',
        pref_reqGeoLoc:   user.pref_reqGeoLoc   ? '1' : '0',
      },
      3: laborTypes.rows,
      4: partTypes.rows,
      5: partOrigins.rows,
      6: fees.rows,
      7: tcTypes.rows,
    },
    { notif: `${notifCount}|${partNotif}` },
  ];
}

module.exports = { handleLogin };
