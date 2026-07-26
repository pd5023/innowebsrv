const pool = require('../db/pool');

async function updateEmployee(emplId, name, phone, email) {
  await pool.query(
    'UPDATE employees SET empl_name=$1, empl_phone=$2, empl_email=$3 WHERE empl_id=$4',
    [name, phone, email, emplId]
  );
  return [{ result: 'ok' }];
}

module.exports = { updateEmployee };
