const pool = require('../db/pool');

// ticket_notifications removed in new schema — notifications now handled via push/email
async function getNotifications(emplId) {
  // Return empty for now; feature to be implemented with new notification approach
  return [{ result: 'norecords' }];
}

async function replyNotification(answer, emplId, tktId, tnItemId) {
  if (answer === '1') {
    await pool.query(
      'UPDATE tickets SET tkt_assigned=$1, tkt_status=2 WHERE tkt_id=$2',
      [emplId, tktId]
    );
  }
  return [{ result: 'ok' }];
}

module.exports = { getNotifications, replyNotification };
