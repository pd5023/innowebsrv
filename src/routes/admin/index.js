const express    = require('express');
const router     = express.Router();

const dashboard  = require('../../handlers/admin/dashboard');
const clients    = require('../../handlers/admin/clients');
const employees  = require('../../handlers/admin/employees');
const tickets    = require('../../handlers/admin/tickets_admin');
const equipment  = require('../../handlers/admin/equipment_admin');
const reports    = require('../../handlers/admin/reports_admin');
const parts      = require('../../handlers/admin/parts_admin');
const auth       = require('../../handlers/admin/login');
const requirePermission = require('../../policy/requirePermission');

// ── Auth (public — no token required) ────────────────────────────────────────
router.post('/login',  async (req, res) => {
  try { res.json(await auth.login(req.body.username, req.body.password)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  res.json(auth.logout(token));
});

// ── Auth middleware — protects everything below, attaches req.auth ────────────
router.use((req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const session = token && auth.getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.auth = session;
  next();
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try { res.json(await dashboard.getDashboard()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Clients ───────────────────────────────────────────────────────────────────
router.get('/clients',          requirePermission('clients', 'read'),   async (req, res) => { try { res.json(await clients.listClients()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/clients/:id',      requirePermission('clients', 'read'),   async (req, res) => { try { res.json(await clients.getClient(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/clients',         requirePermission('clients', 'create'), async (req, res) => { try { res.json(await clients.createClient(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/clients/:id',      requirePermission('clients', 'update'), async (req, res) => { try { res.json(await clients.updateClient(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.delete('/clients/:id',   requirePermission('clients', 'delete'), async (req, res) => { try { res.json(await clients.deleteClient(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Employees (Admin only, per policy matrix) ──────────────────────────────────
router.get('/employees',        requirePermission('employees', 'read'),   async (req, res) => { try { res.json(await employees.listEmployees()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/employees',       requirePermission('employees', 'create'), async (req, res) => { try { res.json(await employees.createEmployee(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/employees/:id',    requirePermission('employees', 'update'), async (req, res) => { try { res.json(await employees.updateEmployee(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/employees/:id/reset-password', requirePermission('employees', 'update'), async (req, res) => { try { res.json(await employees.resetPassword(req.params.id, req.body.password)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Tickets ───────────────────────────────────────────────────────────────────
router.get('/tickets',          async (req, res) => { try { res.json(await tickets.listTickets(req.query)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/tickets/:id/assign',async (req, res) => { try { res.json(await tickets.assignTicket(req.params.id, req.body.empl_id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/tickets/:id/void', async (req, res) => { try { res.json(await tickets.voidTicket(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Equipment ─────────────────────────────────────────────────────────────────
router.get('/equipment',        requirePermission('equipment', 'read'),   async (req, res) => { try { res.json(await equipment.listEquipment(req.query.clt_id, req.auth)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/equipment',       requirePermission('equipment', 'create'), async (req, res) => { try { res.json(await equipment.createEquipment(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/equipment/:id',    requirePermission('equipment', 'update'), async (req, res) => { try { res.json(await equipment.updateEquipment(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/departments',      async (req, res) => { try { res.json(await equipment.listDepartments()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/modalities',       async (req, res) => { try { res.json(await equipment.listModalities()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/makes',            async (req, res) => { try { res.json(await equipment.listMakes()); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Service Reports ───────────────────────────────────────────────────────────
router.get('/reports',          async (req, res) => { try { res.json(await reports.listReports(req.query)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/reports/:id',      async (req, res) => { try { res.json(await reports.getReport(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Parts Orders ──────────────────────────────────────────────────────────────
router.get('/parts',            async (req, res) => { try { res.json(await parts.listParts(req.query)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/parts/:id/status', async (req, res) => { try { const { statusId, receiveDate } = req.body; res.json(await parts.updatePartStatus(req.params.id, statusId, receiveDate)); } catch (e) { res.status(500).json({ error: e.message }); } });

module.exports = router;
