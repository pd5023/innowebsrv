const pool = require('../../db/pool');

async function getDashboard() {
  const [tickets, notifs, engineers, reports] = await Promise.all([
    pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE tkt_assigned IS NULL) AS unassigned FROM tickets WHERE tkt_status = 0"),
    pool.query("SELECT COUNT(*) AS total FROM ticket_notifications WHERE tnif_stop = FALSE"),
    pool.query("SELECT COUNT(*) AS total FROM contacts WHERE is_active = TRUE"),
    pool.query("SELECT COUNT(*) AS total FROM sub_reports WHERE created_at >= NOW() - INTERVAL '30 days'"),
  ]);
  return {
    openTickets:    parseInt(tickets.rows[0].total),
    unassigned:     parseInt(tickets.rows[0].unassigned),
    notifications:  parseInt(notifs.rows[0].total),
    activeEngineers:parseInt(engineers.rows[0].total),
    reportsThisMonth: parseInt(reports.rows[0].total),
  };
}

module.exports = { getDashboard };
