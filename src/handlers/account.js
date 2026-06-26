const pool = require('../db/pool');

async function updateContact(cntId, name, phone, mobile, email) {
  await pool.query(
    'UPDATE contacts SET name=$1, phone=$2, mobile=$3, email=$4 WHERE cnt_id=$5',
    [name, phone, mobile, email, cntId]
  );
  return [{ result: 'ok' }];
}

module.exports = { updateContact };
