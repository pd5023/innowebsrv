const pool = require('../../db/pool');

async function getDashboard() {
  const [tickets, engineers, reports] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE tkt_assigned IS NULL) AS unassigned
                FROM tickets WHERE tkt_status IN (1,2,3)`),
    pool.query('SELECT COUNT(*) AS total FROM employees WHERE empl_isActive = TRUE'),
    pool.query("SELECT COUNT(*) AS total FROM SR WHERE sr_date >= NOW() - INTERVAL '30 days'"),
  ]);
  return {
    openTickets:      parseInt(tickets.rows[0].total),
    unassigned:       parseInt(tickets.rows[0].unassigned),
    activeEngineers:  parseInt(engineers.rows[0].total),
    reportsThisMonth: parseInt(reports.rows[0].total),
  };
}

module.exports = { getDashboard };
