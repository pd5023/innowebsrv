-- InnoWebSrv Database Schema (new design)

CREATE TABLE IF NOT EXISTS zones (
  zone_id      SERIAL PRIMARY KEY,
  zone_name    VARCHAR(50) NOT NULL,
  zone_country VARCHAR(50),
  zone_time    VARCHAR(50) NOT NULL,
  zone_lang    VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS main_office (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(60) NOT NULL,
  address          JSONB,
  main_phone       VARCHAR(20),
  main_800         VARCHAR(20),
  busHrs           VARCHAR(50) DEFAULT 'Mon-Fri 8:00-17:00',
  siteurl          VARCHAR(70),
  zone             INT REFERENCES zones(zone_id) DEFAULT 1,
  pref_hrtick      INT,
  pref_allowSRbill BOOLEAN,
  pref_flexSRtime  BOOLEAN,
  pref_reqGeoLoc   BOOLEAN
);

CREATE TABLE IF NOT EXISTS sub_office (
  sub_id               SERIAL PRIMARY KEY,
  sub_name             VARCHAR(60) NOT NULL,
  sub_address          JSONB,
  sub_phone            VARCHAR(20),
  sub_800              VARCHAR(20),
  sub_busHrs           VARCHAR(50) DEFAULT 'Mon-Fri 8:00-17:00',
  sub_siteurl          VARCHAR(70),
  sub_mainId           INT REFERENCES main_office(id) DEFAULT 1,
  sub_zone             INT REFERENCES zones(zone_id) DEFAULT 1,
  sub_pref_sameAsMain  BOOLEAN DEFAULT TRUE,
  sub_pref_hrtick      INT,
  sub_pref_allowSRbill BOOLEAN,
  sub_pref_flexSRtime  BOOLEAN,
  sub_pref_reqGeoLoc   BOOLEAN
);

CREATE TABLE IF NOT EXISTS role_auth (
  auth_id   SERIAL PRIMARY KEY,
  auth_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS cnt_role (
  role_id   SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS empl_role (
  role_id   SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS modalities (
  mod_id   SERIAL PRIMARY KEY,
  mod_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
  dept_id   SERIAL PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS makes (
  make_id   SERIAL PRIMARY KEY,
  make_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS vendor_types (
  vTypes_id   SERIAL PRIMARY KEY,
  vTypes_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS vendor_business (
  bus_id   SERIAL PRIMARY KEY,
  bus_name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS equipment_srvcBy (
  srvc_id   SERIAL PRIMARY KEY,
  srvc_name VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS equp_coverage (
  cov_id   SERIAL PRIMARY KEY,
  cov_name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS part_origin (
  partFrom_id   SERIAL PRIMARY KEY,
  partFrom_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS part_status (
  partStat_id   SERIAL PRIMARY KEY,
  partStat_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS tkt_status (
  tkt_statId   SERIAL PRIMARY KEY,
  tkt_statName VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS sr_status (
  stat_id   SERIAL PRIMARY KEY,
  stat_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS labor_rates (
  rate_id      SERIAL PRIMARY KEY,
  rate_effDate TIMESTAMP,
  rate_detail  JSONB
);

CREATE TABLE IF NOT EXISTS vendors (
  vend_id        SERIAL PRIMARY KEY,
  vend_name      VARCHAR(60) NOT NULL,
  vend_type      TEXT,
  vend_business  INT REFERENCES vendor_business(bus_id),
  vend_address   JSONB,
  vend_phone     VARCHAR(20),
  vend_800       VARCHAR(20),
  vend_busHrs    VARCHAR(50),
  vend_siteurl   VARCHAR(70),
  vend_zone      INT REFERENCES zones(zone_id) DEFAULT 1,
  vend_cnt1Name  VARCHAR(50),
  vend_cnt1Phone VARCHAR(20),
  vend_cnt1Email VARCHAR(50),
  vend_cnt2Name  VARCHAR(50),
  vend_cnt2Phone VARCHAR(20),
  vend_cnt2Email VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS clients (
  clt_id           SERIAL PRIMARY KEY,
  clt_name         VARCHAR(60) NOT NULL,
  clt_address      JSONB,
  clt_phone        VARCHAR(20),
  clt_800          VARCHAR(20),
  clt_busHrs       VARCHAR(50) DEFAULT 'Mon-Sun 6:00-23:00',
  clt_siteurl      VARCHAR(70),
  clt_zone         INT REFERENCES zones(zone_id) DEFAULT 1,
  clt_subId        INT REFERENCES sub_office(sub_id) DEFAULT 1,
  pref_hrtick      INT,
  pref_allowSRbill BOOLEAN DEFAULT FALSE,
  pref_flexSRtime  BOOLEAN DEFAULT FALSE,
  pref_reqGeoLoc   BOOLEAN DEFAULT FALSE,
  pref_reqSign     BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS client_depts (
  cltDept_id    SERIAL PRIMARY KEY,
  cltDept_cltId INT REFERENCES clients(clt_id),
  cltDept_dept  INT REFERENCES departments(dept_id),
  cltDept_alias VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS contacts (
  cnt_id       SERIAL PRIMARY KEY,
  cnt_cltId    INT REFERENCES clients(clt_id),
  cnt_deptId   INT REFERENCES client_depts(cltDept_id),
  cnt_name     VARCHAR(60) NOT NULL,
  cnt_email    VARCHAR(50),
  cnt_phone    VARCHAR(20),
  cnt_role     TEXT,
  cnt_auth     INT REFERENCES role_auth(auth_id),
  cnt_isActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS employees (
  empl_id         SERIAL PRIMARY KEY,
  empl_subId      INT REFERENCES sub_office(sub_id),
  empl_name       VARCHAR(50) NOT NULL,
  empl_email      VARCHAR(50),
  empl_phone      VARCHAR(20),
  empl_username   VARCHAR(50) UNIQUE NOT NULL,
  empl_password   VARCHAR(200) NOT NULL,
  empl_clientPrim TEXT,
  empl_clientSec  TEXT,
  empl_modals     TEXT,
  empl_role       TEXT,
  empl_titleId    INT REFERENCES empl_role(role_id),
  empl_isActive   BOOLEAN DEFAULT TRUE
);

-- Maps each job title (empl_role) to the permission tier (role_auth) it grants.
-- Admin-editable via the Auth Grid screen — lets titles be reassigned to a
-- different tier for everyone holding that title, without editing each employee.
CREATE TABLE IF NOT EXISTS empl_role_auth (
  role_id INT PRIMARY KEY REFERENCES empl_role(role_id),
  auth_id INT NOT NULL REFERENCES role_auth(auth_id)
);

CREATE TABLE IF NOT EXISTS equipments (
  eqp_id         SERIAL PRIMARY KEY,
  eqp_roomAlias  VARCHAR(100),
  eqp_cltId      INT REFERENCES clients(clt_id),
  eqp_deptId     INT REFERENCES client_depts(cltDept_id),
  eqp_modalId    INT REFERENCES modalities(mod_id),
  eqp_makeId     INT REFERENCES makes(make_id),
  eqp_alias      VARCHAR(50),
  eqp_model      VARCHAR(50),
  eqp_serial     VARCHAR(50),
  eqp_barcode    VARCHAR(50),
  eqp_isActive   BOOLEAN DEFAULT TRUE,
  eqp_emails     TEXT,
  eqp_isContract BOOLEAN DEFAULT FALSE,
  eqp_srvcBy     INT REFERENCES equipment_srvcBy(srvc_id),
  eqp_vendor     INT REFERENCES vendors(vend_id)
);

CREATE TABLE IF NOT EXISTS sub_equipment (
  subeqp_id         SERIAL PRIMARY KEY,
  subeqp_eqpId      INT REFERENCES equipments(eqp_id),
  subeqp_makeId     INT REFERENCES makes(make_id),
  subeqp_model      VARCHAR(50),
  subeqp_serial     VARCHAR(50),
  subeqp_barcode    VARCHAR(50),
  subeqp_isActive   BOOLEAN DEFAULT TRUE,
  subeqp_srvcBy     INT REFERENCES equipment_srvcBy(srvc_id),
  subeqp_vendor     INT REFERENCES vendors(vend_id),
  subeqp_isContract BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tickets (
  tkt_id          SERIAL PRIMARY KEY,
  tkt_cltId       INT REFERENCES clients(clt_id),
  tkt_cntId       INT REFERENCES contacts(cnt_id),
  tkt_eqpId       INT REFERENCES equipments(eqp_id),
  tkt_subEqpId    TEXT,
  tkt_laborTypeId INT REFERENCES labor_rates(rate_id),
  tkt_date        TIMESTAMP DEFAULT NOW(),
  tkt_assigned    INT REFERENCES employees(empl_id),
  tkt_shrtDesc    VARCHAR(200),
  tkt_desc        TEXT,
  tkt_po          VARCHAR(50),
  tkt_poLimit     NUMERIC(12,2) DEFAULT 0.00,
  tkt_poDate      TIMESTAMP,
  tkt_status      SMALLINT REFERENCES tkt_status(tkt_statId) DEFAULT 1,
  tkt_cancelBy    INT DEFAULT -1,
  tkt_cancelDate  TIMESTAMP,
  tkt_hasPics     BOOLEAN DEFAULT FALSE,
  created_by      INT REFERENCES employees(empl_id),
  tkt_emails      TEXT
);

CREATE TABLE IF NOT EXISTS SR (
  sr_id       SERIAL PRIMARY KEY,
  sr_tktId    INT REFERENCES tickets(tkt_id),
  sr_eqpId    INT REFERENCES equipments(eqp_id),
  sr_subEqpId TEXT,
  sr_date     TIMESTAMP DEFAULT NOW(),
  sr_shrtDesc VARCHAR(200),
  sr_desc     TEXT,
  sr_status   SMALLINT REFERENCES sr_status(stat_id),
  sr_hrs      JSONB DEFAULT '{"Start":"0:00","Out":"0:00","In":"0:00","End":"0:00"}',
  sr_hasPics  BOOLEAN DEFAULT FALSE,
  sr_sign     TEXT,
  sr_signName VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS SR_pics (
  srPics_id     SERIAL PRIMARY KEY,
  srPics_srId   INT REFERENCES SR(sr_id),
  srPics_Base64 TEXT,
  srPics_date   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts (
  part_id          SERIAL PRIMARY KEY,
  part_tktId       INT REFERENCES tickets(tkt_id),
  part_srId        INT REFERENCES SR(sr_id),
  part_dateOrder   TIMESTAMP DEFAULT NOW(),
  part_dateReceive TIMESTAMP,
  part_name        VARCHAR(100),
  part_num         VARCHAR(50),
  part_vendor      INT REFERENCES vendors(vend_id),
  part_price       NUMERIC(12,2) DEFAULT 0.00,
  part_status      INT REFERENCES part_status(partStat_id)
);

CREATE TABLE IF NOT EXISTS POs (
  po_id    SERIAL PRIMARY KEY,
  po_cltId INT REFERENCES clients(clt_id),
  po_cntId INT REFERENCES contacts(cnt_id),
  po_tktId INT REFERENCES tickets(tkt_id),
  po_num   VARCHAR(50) NOT NULL,
  po_limit NUMERIC(12,2),
  po_date  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts_main (
  contract_id       SERIAL PRIMARY KEY,
  contract_cltId    INT REFERENCES clients(clt_id),
  contract_name     VARCHAR(60),
  contract_po       VARCHAR(50),
  contract_strtDate TIMESTAMP,
  contract_endDate  TIMESTAMP,
  contract_price    NUMERIC(12,2) DEFAULT 0.00,
  contract_signedBy INT REFERENCES contacts(cnt_id)
);

CREATE TABLE IF NOT EXISTS contracts_dept (
  contDept_id         SERIAL PRIMARY KEY,
  contDept_contractId INT REFERENCES contracts_main(contract_id),
  contDept_deptId     INT REFERENCES client_depts(cltDept_id)
);

CREATE TABLE IF NOT EXISTS contracts_equip (
  contEqp_id       SERIAL PRIMARY KEY,
  contEqp_deptId   INT REFERENCES contracts_dept(contDept_id),
  contEqp_srvcBy   INT REFERENCES equipment_srvcBy(srvc_id),
  contEqp_vendor   INT REFERENCES vendors(vend_id),
  contEqp_coverage TEXT,
  contEqp_notes    VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS contracts_SubEquip (
  contSubEqp_id       SERIAL PRIMARY KEY,
  contSubEqp_eqpId    INT REFERENCES contracts_equip(contEqp_id),
  contSubEqp_srvcBy   INT REFERENCES equipment_srvcBy(srvc_id),
  contSubEqp_vendor   INT REFERENCES vendors(vend_id),
  contSubEqp_coverage TEXT,
  contSubEqp_notes    VARCHAR(200)
);

CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(tkt_status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(tkt_assigned);
CREATE INDEX IF NOT EXISTS idx_sr_tkt           ON SR(sr_tktId);
CREATE INDEX IF NOT EXISTS idx_parts_tkt        ON parts(part_tktId);
