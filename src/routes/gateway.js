const express = require('express');
const router = express.Router();

const tickets = require('../handlers/tickets');
const sr      = require('../handlers/sr');
const notifs  = require('../handlers/notifications');
const history = require('../handlers/history');
const parts   = require('../handlers/parts');
const tc      = require('../handlers/timecard');
const account = require('../handlers/account');

// Replicates: GET /includes/dyncont/gateway.php?z=host&q=command
// All commands are pipe-delimited strings
router.get('/', async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) return res.json([{ error: 'missing' }]);

  const p = q.split('|');
  const cmd = p[0];

  try {
    let result;

    switch (cmd) {
      // ── Tickets ────────────────────────────────────────────────────────────
      case 'gettkts':
        result = await tickets.getTickets(p[1], p[2], p[3]);
        break;
      case 'getTktPics':
        result = await tickets.getTicketPics(p[1]);
        break;
      case 'newCall':
        result = await tickets.createTicket(p[1], p[2], p[3], p[4] !== '0' ? p[4] : null);
        break;
      case 'getVoidedTkts':
        result = await tickets.getVoidedTickets(p[1]);
        break;

      // ── Service Report ─────────────────────────────────────────────────────
      case 'SRdetails':
        result = await sr.getSrDetails(p[1], p[2], p[3], p[4], p[5]);
        break;

      // ── Notifications ──────────────────────────────────────────────────────
      case 'getNotifs':
        result = await notifs.getNotifications(p[1]);
        break;
      case 'replyTkt':
        result = await notifs.replyNotification(p[1], p[2], p[3], p[4]);
        break;

      // ── History ────────────────────────────────────────────────────────────
      case 'gethist1':
        result = await history.getHistory(p[1], p[2], p[3]);
        break;
      case 'gethist2':
        result = await history.getEquipHistory(p[1]);
        break;
      case 'getscanresult':
        result = await history.getScanResult(p[1]);
        break;

      // ── Parts ──────────────────────────────────────────────────────────────
      case 'getPartOrders':
        result = await parts.getPartOrders(p[1]);
        break;

      // ── Time Card ──────────────────────────────────────────────────────────
      case 'getTCToday':
        result = await tc.getTCToday(p[1]);
        break;
      case 'updateTC':
        result = await tc.updateTC(p[1], p[2]);
        break;
      case 'getTCPeriod':
        result = await tc.getTCPeriod(p[1]);
        break;

      // ── Account ────────────────────────────────────────────────────────────
      case 'updateCnt':
        result = await account.updateContact(p[1], p[2], p[3], p[4], p[5]);
        break;

      default:
        result = [{ error: `unknown command: ${cmd}` }];
    }

    res.json(result);
  } catch (err) {
    console.error(`[${cmd}] error:`, err.message);
    res.status(500).json([{ error: err.message }]);
  }
});

module.exports = router;
