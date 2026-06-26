const pool = require('../db/pool');

async function getSrDetails(tktId, eqpId, cntId, woType, zone) {
  const [rateRes, contractRes, emplRes, partsRes, equipRes, histRes, woPartsRes] = await Promise.all([
    pool.query('SELECT rate_labreg, rate_trvreg, rate_labOT, rate_trvOT FROM labor_rates WHERE clt_id = (SELECT clt_id FROM tickets WHERE tkt_id = $1)', [tktId]),
    pool.query('SELECT quote_eqp, cov_end, cov_hrs, cov_days, cov_options FROM contracts WHERE clt_id = (SELECT clt_id FROM tickets WHERE tkt_id = $1) LIMIT 1', [tktId]),
    pool.query('SELECT cnt_id AS id, name, zone_id AS zone FROM contacts WHERE clt_id = (SELECT clt_id FROM tickets WHERE tkt_id = $1) AND is_active = TRUE ORDER BY name', [tktId]),
    pool.query('SELECT part_id AS "partID", part_desc, part_numb, part_qty, part_price, part_orig, part_cat, tkt_id AS part_tkt_numb, part_billed FROM parts WHERE tkt_id = $1', [tktId]),
    pool.query('SELECT subeqp_id, eqtype_name, eqp_model, subeqp_serial, subeqp_main FROM sub_equipment WHERE eqp_id = $1', [eqpId]),
    pool.query('SELECT sr_id AS "serv_SRID", sr_emails AS "serv_emails", sr_po AS "serv_po", sr_pic1 AS "serv_pic1", sr_pic2 AS "serv_pic2", sr_capt1 AS "serv_capt1", sr_capt2 AS "serv_capt2" FROM service_reports WHERE tkt_id = $1 ORDER BY created_at DESC LIMIT 1', [tktId]),
    pool.query('SELECT p.*, sp.sp_qty, sp.sp_billed FROM sr_parts sp JOIN parts p ON p.part_id = sp.part_id WHERE sp.sr_id = (SELECT sr_id FROM service_reports WHERE tkt_id = $1 ORDER BY created_at DESC LIMIT 1)', [tktId]),
  ]);

  const result = new Array(9).fill(null);
  result[0] = rateRes.rows[0] ?? { rate_labreg: 0, rate_trvreg: 0, rate_labOT: 0, rate_trvOT: 0 };
  result[1] = contractRes.rows[0] ?? { result: 'nocontract' };
  result[2] = emplRes.rows;
  result[3] = partsRes.rows.length > 0 ? partsRes.rows : [{ result: 'norecords' }];
  result[4] = equipRes.rows.length > 0 ? equipRes.rows : [{ result: 'norecords' }];
  result[5] = woType == 2 ? '[]' : { result: 'norecords' };
  result[6] = null;
  result[7] = histRes.rows[0] ?? { result: 'norecords' };
  result[8] = woPartsRes.rows.length > 0 ? woPartsRes.rows : [{ result: 'norecords' }];
  return result;
}

async function submitSr(body) {
  // Parse the pipe/backtick delimited SR payload
  // Format: tktId`repairs~srId`hours`labRate`billable`noBillRsn`employees~srId`complete`signName`po`date`cntId`emails`pmTasks`img``~`~equips^^parts`srId
  try {
    const [mainPart] = body.split('^^');
    const fields = mainPart.split('`');
    const tktId   = parseInt(fields[0]);
    const repairs  = fields[1]?.split('~')[0] ?? '';
    const hours    = fields[2] ?? '';
    const labRate  = parseFloat(fields[3]) || 0;
    const billable = fields[4] === '1';
    const noBill   = fields[5] ?? '';
    const empl     = fields[6]?.split('~')[0] ?? '';
    const complete = fields[7] === '1';
    const signName = fields[8] ?? '';
    const po       = fields[9] ?? '';
    const srDate   = fields[10] ?? new Date().toISOString().split('T')[0];
    const cntId    = parseInt(fields[11]);
    const emails   = fields[12] ?? '';
    const pmTasks  = fields[13] ?? '';
    const img      = fields[14] ?? '';

    const srRes = await pool.query(
      `INSERT INTO service_reports
         (tkt_id, cnt_id, sr_date, sr_repairs, sr_lab_rate, sr_billable,
          sr_no_bill_rsn, sr_complete, sr_sign_name, sr_sign, sr_po, sr_employees, sr_emails, sr_pm_tasks, sr_pic1)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING sr_id`,
      [tktId, cntId || null, srDate, repairs, labRate, billable, noBill,
       complete, signName, img ? `data:image/png;base64,${img}` : '', po, empl, emails, pmTasks, '']
    );

    const srId = srRes.rows[0].sr_id;

    // Parse and insert hours
    if (hours) {
      for (const h of hours.split('@').filter(Boolean)) {
        const [engId, type, start, end] = h.split('~');
        if (engId && start && end) {
          await pool.query(
            'INSERT INTO sr_hours (sr_id, cnt_id, hr_type, time_in, time_out) VALUES ($1,$2,$3,$4,$5)',
            [srId, parseInt(engId), parseInt(type), parseInt(start), parseInt(end)]
          );
        }
      }
    }

    // Close ticket
    await pool.query('UPDATE tickets SET tkt_status = 1 WHERE tkt_id = $1', [tktId]);

    return [{ result: 'ok', sr_id: srId }];
  } catch (err) {
    console.error('SR submit error:', err);
    return [{ error: err.message }];
  }
}

module.exports = { getSrDetails, submitSr };
