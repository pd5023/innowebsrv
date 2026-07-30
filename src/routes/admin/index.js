const express    = require('express');
const router     = express.Router();

const dashboard  = require('../../handlers/admin/dashboard');
const clients    = require('../../handlers/admin/clients');
const employees  = require('../../handlers/admin/employees');
const tickets    = require('../../handlers/admin/tickets_admin');
const equipment  = require('../../handlers/admin/equipment_admin');
const reports    = require('../../handlers/admin/reports_admin');
const parts      = require('../../handlers/admin/parts_admin');
const offices    = require('../../handlers/admin/offices');
const authGrid   = require('../../handlers/admin/authGrid');
const clientDepts = require('../../handlers/admin/clientDepts');
const contacts   = require('../../handlers/admin/contacts');
const subEquipment = require('../../handlers/admin/subEquipment');
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
router.get('/zones',             async (req, res) => { try { res.json(await offices.listZones()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/suboffices',        async (req, res) => { try { res.json(await offices.listSubOffices()); } catch (e) { res.status(500).json({ error: e.message }); } });

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
router.get('/equipment/:id',    requirePermission('equipment', 'read'),   async (req, res) => { try { res.json(await equipment.getEquipment(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/equipment',       requirePermission('equipment', 'create'), async (req, res) => { try { res.json(await equipment.createEquipment(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/equipment/:id',    requirePermission('equipment', 'update'), async (req, res) => { try { res.json(await equipment.updateEquipment(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/departments',      async (req, res) => { try { res.json(await equipment.listDepartments()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/modalities',       async (req, res) => { try { res.json(await equipment.listModalities()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/makes',            async (req, res) => { try { res.json(await equipment.listMakes()); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Client Departments ──────────────────────────────────────────────────────────
router.get('/client-depts',     requirePermission('depts', 'read'),   async (req, res) => { try { res.json(await clientDepts.listClientDepts(req.query.clt_id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/client-depts',    requirePermission('depts', 'create'), async (req, res) => { try { res.json(await clientDepts.createClientDept(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/client-depts/:id', requirePermission('depts', 'update'), async (req, res) => { try { res.json(await clientDepts.updateClientDept(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.delete('/client-depts/:id', requirePermission('depts', 'delete'), async (req, res) => { try { res.json(await clientDepts.deleteClientDept(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Client Contacts ──────────────────────────────────────────────────────────────
router.get('/contacts',         requirePermission('clientContacts', 'read'),   async (req, res) => { try { res.json(await contacts.listContacts(req.query.clt_id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/contacts',        requirePermission('clientContacts', 'create'), async (req, res) => { try { res.json(await contacts.createContact(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/contacts/:id',     requirePermission('clientContacts', 'update'), async (req, res) => { try { res.json(await contacts.updateContact(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.delete('/contacts/:id',  requirePermission('clientContacts', 'delete'), async (req, res) => { try { res.json(await contacts.deleteContact(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/cnt-roles',        async (req, res) => { try { res.json(await contacts.listCntRoles()); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Sub-Equipment ─────────────────────────────────────────────────────────────────
router.get('/sub-equipment',       requirePermission('subEquipment', 'read'),   async (req, res) => { try { res.json(await subEquipment.listSubEquipment(req.query.eqp_id)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.post('/sub-equipment',      requirePermission('subEquipment', 'create'), async (req, res) => { try { res.json(await subEquipment.createSubEquipment(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/sub-equipment/:id',   requirePermission('subEquipment', 'update'), async (req, res) => { try { res.json(await subEquipment.updateSubEquipment(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.delete('/sub-equipment/:id',requirePermission('subEquipment', 'delete'), async (req, res) => { try { res.json(await subEquipment.deleteSubEquipment(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Service Reports ───────────────────────────────────────────────────────────
router.get('/reports',          async (req, res) => { try { res.json(await reports.listReports(req.query)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/reports/:id',      async (req, res) => { try { res.json(await reports.getReport(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Parts Orders ──────────────────────────────────────────────────────────────
router.get('/parts',            async (req, res) => { try { res.json(await parts.listParts(req.query)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/parts/:id/status', async (req, res) => { try { const { statusId, receiveDate } = req.body; res.json(await parts.updatePartStatus(req.params.id, statusId, receiveDate)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Offices (Main Office, Zones, Sub-Offices — Admin only) ─────────────────────
router.get('/main-office',      requirePermission('offices', 'read'),   async (req, res) => { try { res.json(await offices.getMainOffice()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/main-office/:id',  requirePermission('offices', 'update'), async (req, res) => { try { res.json(await offices.updateMainOffice(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });

router.post('/zones',           requirePermission('offices', 'create'), async (req, res) => { try { res.json(await offices.createZone(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/zones/:id',        requirePermission('offices', 'update'), async (req, res) => { try { res.json(await offices.updateZone(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.delete('/zones/:id',     requirePermission('offices', 'delete'), async (req, res) => { try { res.json(await offices.deleteZone(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

router.post('/suboffices',      requirePermission('offices', 'create'), async (req, res) => { try { res.json(await offices.createSubOffice(req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/suboffices/:id',   requirePermission('offices', 'update'), async (req, res) => { try { res.json(await offices.updateSubOffice(req.params.id, req.body)); } catch (e) { res.status(500).json({ error: e.message }); } });
router.delete('/suboffices/:id',requirePermission('offices', 'delete'), async (req, res) => { try { res.json(await offices.deleteSubOffice(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Auth Grid (title -> permission tier mapping — Admin only) ──────────────────
router.get('/empl-roles',          requirePermission('permissions', 'read'),   async (req, res) => { try { res.json(await authGrid.listEmplRoles()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/role-auth-tiers',     requirePermission('permissions', 'read'),   async (req, res) => { try { res.json(await authGrid.listRoleAuthTiers()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/empl-role-auth-map',  requirePermission('permissions', 'read'),   async (req, res) => { try { res.json(await authGrid.getEmplRoleAuthMap()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.put('/empl-role-auth-map/:roleId', requirePermission('permissions', 'update'), async (req, res) => { try { res.json(await authGrid.setEmplRoleAuth(req.params.roleId, req.body.auth_id)); } catch (e) { res.status(500).json({ error: e.message }); } });

module.exports = router;
