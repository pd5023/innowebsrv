const express    = require('express');
const router     = express.Router();

const dashboard  = require('../../handlers/admin/dashboard');
const clients    = require('../../handlers/admin/clients');
const contacts   = require('../../handlers/admin/contacts');
const tickets    = require('../../handlers/admin/tickets_admin');
const equipment  = require('../../handlers/admin/equipment_admin');
const reports    = require('../../handlers/admin/reports_admin');
const parts      = require('../../handlers/admin/parts_admin');
const auth       = require('../../handlers/admin/login');

// ── Auth (public — no token required) ────────────────────────────────────────
router.post('/login',  async (req, res) => {
  try {
    const result = await auth.login(req.body.username, req.body.password);
    console.log('[login] user:', req.body.username, '| result:', JSON.stringify(result));
    res.json(result);
  }
  catch (e) {
    console.error('[login] exception:', e.message);
    res.status(500).json({ error: e.message });
  }
});
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  res.json(auth.logout(token));
});

// ── Auth middleware — protects everything below ───────────────────────────────
router.use((req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !auth.getSession(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try { res.json(await dashboard.getDashboard()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Clients ───────────────────────────────────────────────────────────────────
router.get('/clients',          async (req, res) => { try { res.json(await clients.listClients()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/clients/:id',      async (req, res) => { try { res.json(await clients.getClient(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/clients',         async (req, res) => { try { res.json(await clients.createClient(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/clients/:id',      async (req, res) => { try { res.json(await clients.updateClient(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.delete('/clients/:id',   async (req, res) => { try { res.json(await clients.deleteClient(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Contacts / Engineers ──────────────────────────────────────────────────────
router.get('/contacts',         async (req, res) => { try { res.json(await contacts.listContacts(req.query.clt_id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/contacts',        async (req, res) => { try { res.json(await contacts.createContact(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/contacts/:id',     async (req, res) => { try { res.json(await contacts.updateContact(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/contacts/:id/reset-password', async (req, res) => { try { res.json(await contacts.resetPassword(req.params.id, req.body.password)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Tickets ───────────────────────────────────────────────────────────────────
router.get('/tickets',          async (req, res) => { try { res.json(await tickets.listTickets(req.query)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/tickets/:id/assign',async (req, res) => { try { res.json(await tickets.assignTicket(req.params.id, req.body.cnt_id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/tickets/:id/void', async (req, res) => { try { res.json(await tickets.voidTicket(req.params.id, req.body.reason)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/tickets/:id/notify', async (req, res) => { try { res.json(await tickets.sendNotification(req.params.id, req.body.cnt_id, req.body.message)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Equipment ─────────────────────────────────────────────────────────────────
router.get('/equipment',        async (req, res) => { try { res.json(await equipment.listEquipment(req.query.clt_id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/equipment',       async (req, res) => { try { res.json(await equipment.createEquipment(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/equipment/:id',    async (req, res) => { try { res.json(await equipment.updateEquipment(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/departments',      async (req, res) => { try { res.json(await equipment.listDepartments(req.query.clt_id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/modalities',       async (req, res) => { try { res.json(await equipment.listModalities(req.query.clt_id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/makes',            async (req, res) => { try { res.json(await equipment.listMakes(req.query.clt_id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Service Reports ───────────────────────────────────────────────────────────
router.get('/reports',          async (req, res) => { try { res.json(await reports.listReports(req.query)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/reports/:id',      async (req, res) => { try { res.json(await reports.getReport(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Parts Orders ──────────────────────────────────────────────────────────────
router.get('/parts',            async (req, res) => { try { res.json(await parts.listParts(req.query)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/parts/:id/status', async (req, res) => { try { const { status, o_desc, o_number, o_qty } = req.body; res.json(await parts.updatePartStatus(req.params.id, status, o_desc, o_number, o_qty)); } catch (e) { res.status(500).json({ error: e.message }); } });

module.exports = router;
