const pool = require('../db/pool');

async function getSrDetails(tktId, eqpId) {
  const [rateRes, contractRes, emplRes, partsRes, subEqpRes, lastSrRes] = await Promise.all([
    pool.query('SELECT rate_id, rate_detail FROM labor_rates ORDER BY rate_effDate DESC LIMIT 1'),
    pool.query(
      `SELECT cm.contract_id, cm.contract_name, cm.contract_endDate,
              ce.contEqp_coverage
       FROM contracts_main cm
       JOIN contracts_dept  cd ON cd.contDept_contractId = cm.contract_id
       JOIN contracts_equip ce ON ce.contEqp_deptId = cd.contDept_id
       WHERE cm.contract_cltId = (SELECT tkt_cltId FROM tickets WHERE tkt_id = $1) LIMIT 1`,
      [tktId]
    ),
    pool.query(
      `SELECT empl_id AS id, empl_name AS name FROM employees
       WHERE empl_isActive = TRUE ORDER BY empl_name`,
      []
    ),
    pool.query(
      `SELECT part_id AS "partID", part_name, part_num, part_price,
              part_status, part_tktId AS part_tkt_numb
       FROM parts WHERE part_tktId = $1`,
      [tktId]
    ),
    pool.query(
      `SELECT subeqp_id, subeqp_model, subeqp_serial, subeqp_isActive
       FROM sub_equipment WHERE subeqp_eqpId = $1`,
      [eqpId]
    ),
    pool.query(
      `SELECT sr_id, sr_date, sr_hrs, sr_desc, sr_status, sr_signName, sr_hasPics
       FROM SR WHERE sr_tktId = $1 ORDER BY sr_date DESC LIMIT 1`,
      [tktId]
    ),
  ]);

  const result = new Array(9).fill(null);
  result[0] = rateRes.rows[0] ?? { rate_id: null, rate_detail: {} };
  result[1] = contractRes.rows[0] ?? { result: 'nocontract' };
  result[2] = emplRes.rows;
  result[3] = partsRes.rows.length > 0 ? partsRes.rows : [{ result: 'norecords' }];
  result[4] = subEqpRes.rows.length > 0 ? subEqpRes.rows : [{ result: 'norecords' }];
  result[5] = { result: 'norecords' };
  result[6] = null;
  result[7] = lastSrRes.rows[0] ?? { result: 'norecords' };
  result[8] = { result: 'norecords' };
  return result;
}

async function submitSr(body) {
  // Format: tktId`eqpId`shrtDesc`desc`status`hrs(json)`signName`sign^^pics
  try {
    const [mainPart] = body.split('^^');
    const fields   = mainPart.split('`');
    const tktId    = parseInt(fields[0]);
    const eqpId    = parseInt(fields[1]);
    const shrtDesc = fields[2] ?? '';
    const desc     = fields[3] ?? '';
    const status   = parseInt(fields[4]) || 1;
    const hrs      = fields[5] ?? '{"Start":"0:00","Out":"0:00","In":"0:00","End":"0:00"}';
    const signName = fields[6] ?? '';
    const sign     = fields[7] ?? '';

    const srRes = await pool.query(
      `INSERT INTO SR
         (sr_tktId, sr_eqpId, sr_date, sr_shrtDesc, sr_desc,
          sr_status, sr_hrs, sr_signName, sr_sign)
       VALUES ($1,$2,NOW(),$3,$4,$5,$6,$7,$8)
       RETURNING sr_id`,
      [tktId, eqpId || null, shrtDesc, desc, status,
       JSON.parse(hrs), signName, sign ? `data:image/png;base64,${sign}` : '']
    );

    const srId = srRes.rows[0].sr_id;

    // Close ticket when SR status = 4 (Completed)
    if (status === 4) {
      await pool.query('UPDATE tickets SET tkt_status = 4 WHERE tkt_id = $1', [tktId]);
    }

    return [{ result: 'ok', sr_id: srId }];
  } catch (err) {
    console.error('SR submit error:', err);
    return [{ error: err.message }];
  }
}

module.exports = { getSrDetails, submitSr };
