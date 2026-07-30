// Static role -> resource -> CRUD matrix.
// Encodes the two-axis model: role_auth (scope tier) + cnt_role (client permission set).
// When the Admin-editable auth screen is built, this same shape moves into
// permission_roles / permission_grants tables — call sites (can/scopeOf) won't change.

const SCOPE = {
  GLOBAL:             'global',            // Admin — all zones / sub-offices
  ZONE:               'zone',              // Contracts — all sub-offices within their zone
  SUBOFFICE:          'suboffice',         // Manager, Employee — their own sub-office
  SUBOFFICE_MODALITY: 'suboffice_modality',// Supervisor — own sub-office, filtered by modality
  CLIENT:             'client',            // Client-Admin, Client-Manager — their own client
  CLIENT_MODALITY:    'client_modality',   // Client-Supervisor, Client-Technician — own client, filtered by modality
};

const NONE = { create: false, read: false, update: false, delete: false };
const RO   = { create: false, read: true,  update: false, delete: false };
const CRUD = { create: true,  read: true,  update: true,  delete: true  };

const ROLES = {
  Admin: {
    scope: SCOPE.GLOBAL,
    perms: {
      clients: CRUD, depts: CRUD, clientContacts: CRUD, employees: CRUD,
      equipment: CRUD, subEquipment: CRUD, contracts: CRUD, offices: CRUD,
      permissions: CRUD,
    },
  },
  Contracts: {
    scope: SCOPE.ZONE,
    perms: {
      clients: RO, depts: RO, clientContacts: RO, employees: NONE,
      equipment: RO, subEquipment: RO, contracts: CRUD,
    },
  },
  Manager: {
    scope: SCOPE.SUBOFFICE,
    perms: {
      clients: RO, depts: RO, clientContacts: RO, employees: NONE,
      equipment: CRUD, subEquipment: CRUD, contracts: RO,
    },
  },
  Supervisor: {
    scope: SCOPE.SUBOFFICE_MODALITY,
    perms: {
      clients: RO, depts: RO, clientContacts: RO, employees: NONE,
      equipment: CRUD, subEquipment: CRUD, contracts: RO,
    },
  },
  Employee: {
    scope: SCOPE.SUBOFFICE,
    perms: {
      clients: RO, depts: RO, clientContacts: RO, employees: NONE,
      equipment: RO, subEquipment: RO, contracts: RO,
    },
  },
  'Client-Admin': {
    scope: SCOPE.CLIENT,
    perms: {
      depts: CRUD, clientContacts: CRUD, equipment: CRUD, subEquipment: CRUD, contracts: RO,
    },
  },
  'Client-Manager': {
    scope: SCOPE.CLIENT,
    perms: {
      depts: RO, clientContacts: RO, equipment: CRUD, subEquipment: CRUD, contracts: RO,
    },
  },
  'Client-Supervisor': {
    scope: SCOPE.CLIENT_MODALITY,
    perms: {
      depts: RO, clientContacts: RO, equipment: CRUD, subEquipment: CRUD, contracts: RO,
    },
  },
  'Client-Technician': {
    scope: SCOPE.CLIENT_MODALITY,
    perms: {
      depts: RO, clientContacts: RO, equipment: RO, subEquipment: RO, contracts: RO,
    },
  },
};

function can(role, resource, action) {
  return !!ROLES[role]?.perms?.[resource]?.[action];
}

function scopeOf(role) {
  return ROLES[role]?.scope ?? null;
}

module.exports = { SCOPE, ROLES, can, scopeOf };
