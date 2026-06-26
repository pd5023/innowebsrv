-- InnoWebSrv Database Schema

CREATE TABLE IF NOT EXISTS clients (
  clt_id           SERIAL PRIMARY KEY,
  clt_name         VARCHAR(100) NOT NULL,
  clt_main_nb      VARCHAR(20),
  clt_main800      VARCHAR(20),
  clt_busHrs       VARCHAR(50),
  clt_siteurl      VARCHAR(200),
  clt_lang         VARCHAR(10) DEFAULT 'en',
  clt_zone         INT DEFAULT 1,
  clt_tc_lunch     INT DEFAULT 60,
  pref_hrtick      INT DEFAULT 15,
  pref_allowSRbill BOOLEAN DEFAULT FALSE,
  pref_flexSRtime  BOOLEAN DEFAULT FALSE,
  pref_reqGeoLoc   BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS zones (
  zone_id   SERIAL PRIMARY KEY,
  zone_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  cat_id   SERIAL PRIMARY KEY,
  cat_name VARCHAR(50) NOT NULL,
  clt_id   INT REFERENCES clients(clt_id)
);

CREATE TABLE IF NOT EXISTS contacts (
  cnt_id    SERIAL PRIMARY KEY,
  clt_id    INT REFERENCES clients(clt_id),
  cat_id    INT REFERENCES categories(cat_id),
  zone_id   INT REFERENCES zones(zone_id),
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(150),
  phone     VARCHAR(20),
  mobile    VARCHAR(20),
  username  VARCHAR(50) UNIQUE NOT NULL,
  password  VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS labor_types (
  lt_id  SERIAL PRIMARY KEY,
  clt_id INT REFERENCES clients(clt_id),
  cat_id INT REFERENCES categories(cat_id),
  name   VARCHAR(80) NOT NULL,
  opt    VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS part_origins (
  po_id  SERIAL PRIMARY KEY,
  clt_id INT REFERENCES clients(clt_id),
  name   VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS part_types (
  pt_id  SERIAL PRIMARY KEY,
  clt_id INT REFERENCES clients(clt_id),
  name   VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS fees (
  fee_id SERIAL PRIMARY KEY,
  clt_id INT REFERENCES clients(clt_id),
  cat_id INT REFERENCES categories(cat_id),
  name   VARCHAR(80),
  rate   NUMERIC(10,2),
  link   CHAR(1) DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS tc_types (
  tct_id SERIAL PRIMARY KEY,
  clt_id INT REFERENCES clients(clt_id),
  name   VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS labor_rates (
  lr_id       SERIAL PRIMARY KEY,
  clt_id      INT REFERENCES clients(clt_id),
  rate_labreg NUMERIC(10,2) DEFAULT 0,
  rate_trvreg NUMERIC(10,2) DEFAULT 0,
  rate_labOT  NUMERIC(10,2) DEFAULT 0,
  rate_trvOT  NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS modalities (
  modal_id   SERIAL PRIMARY KEY,
  clt_id     INT REFERENCES clients(clt_id),
  cat_id     INT REFERENCES categories(cat_id),
  modal_name VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS makes (
  make_id   SERIAL PRIMARY KEY,
  clt_id    INT REFERENCES clients(clt_id),
  make_name VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
  dept_id   SERIAL PRIMARY KEY,
  clt_id    INT REFERENCES clients(clt_id),
  dept_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS equipment (
  eqp_id      SERIAL PRIMARY KEY,
  clt_id      INT REFERENCES clients(clt_id),
  dept_id     INT REFERENCES departments(dept_id),
  modal_id    INT REFERENCES modalities(modal_id),
  make_id     INT REFERENCES makes(make_id),
  eqp_alias   VARCHAR(100),
  eqp_model   VARCHAR(100),
  eqp_serial  VARCHAR(100),
  eqp_barcode VARCHAR(50),
  is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sub_equipment (
  subeqp_id     SERIAL PRIMARY KEY,
  eqp_id        INT REFERENCES equipment(eqp_id),
  eqtype_name   VARCHAR(80),
  eqp_model     VARCHAR(100),
  subeqp_serial VARCHAR(100),
  subeqp_main   BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS contracts (
  cov_id      SERIAL PRIMARY KEY,
  clt_id      INT REFERENCES clients(clt_id),
  quote_eqp   TEXT,
  cov_end     DATE,
  cov_hrs     VARCHAR(20),
  cov_days    VARCHAR(10),
  cov_options VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS pm_tasks (
  pm_id      SERIAL PRIMARY KEY,
  modal_id   INT REFERENCES modalities(modal_id),
  pm_name    VARCHAR(200) NOT NULL,
  pm_type    VARCHAR(20) DEFAULT 'bool',
  pm_options TEXT,
  pm_instr   TEXT
);

CREATE TABLE IF NOT EXISTS tickets (
  tkt_id        SERIAL PRIMARY KEY,
  clt_id        INT REFERENCES clients(clt_id),
  eqp_id        INT REFERENCES equipment(eqp_id),
  labor_type_id INT REFERENCES labor_types(lt_id),
  tkt_date      TIMESTAMP DEFAULT NOW(),
  tkt_assigned  INT REFERENCES contacts(cnt_id),
  tkt_shrt_desc VARCHAR(200),
  tkt_desc      TEXT,
  tkt_name      VARCHAR(100),
  tkt_email     VARCHAR(150),
  tkt_phone     VARCHAR(20),
  tkt_po        VARCHAR(100),
  tkt_status    SMALLINT DEFAULT 0,
  has_pics      SMALLINT DEFAULT 0,
  created_by    INT REFERENCES contacts(cnt_id)
);

CREATE TABLE IF NOT EXISTS ticket_notifications (
  tn_id          SERIAL PRIMARY KEY,
  tkt_id         INT REFERENCES tickets(tkt_id),
  tn_item_start  TIMESTAMP DEFAULT NOW(),
  tn_item_status VARCHAR(20),
  tn_item_usr    INT REFERENCES contacts(cnt_id),
  tnif_stop      BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ticket_pics (
  pic_id    SERIAL PRIMARY KEY,
  tkt_id    INT REFERENCES tickets(tkt_id),
  pic_data  TEXT,
  pic_title VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS parts (
  part_id      SERIAL PRIMARY KEY,
  clt_id       INT REFERENCES clients(clt_id),
  tkt_id       INT REFERENCES tickets(tkt_id),
  part_desc    VARCHAR(200),
  part_numb    VARCHAR(100),
  part_qty     NUMERIC(10,2) DEFAULT 1,
  part_price   NUMERIC(10,2) DEFAULT 0,
  part_orig    VARCHAR(50),
  part_cat     VARCHAR(50),
  part_billed  BOOLEAN DEFAULT FALSE,
  order_status VARCHAR(20) DEFAULT 'Ordered',
  o_desc       VARCHAR(200),
  o_number     VARCHAR(100),
  o_qty        NUMERIC(10,2),
  date_req     TIMESTAMP DEFAULT NOW(),
  changed      BOOLEAN DEFAULT FALSE,
  diff         BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS service_reports (
  sr_id          SERIAL PRIMARY KEY,
  tkt_id         INT REFERENCES tickets(tkt_id),
  cnt_id         INT REFERENCES contacts(cnt_id),
  sr_date        DATE DEFAULT CURRENT_DATE,
  sr_repairs     TEXT,
  sr_lab_rate    NUMERIC(10,2),
  sr_billable    BOOLEAN DEFAULT FALSE,
  sr_no_bill_rsn TEXT,
  sr_complete    BOOLEAN DEFAULT FALSE,
  sr_sign_name   VARCHAR(100),
  sr_sign        TEXT,
  sr_po          VARCHAR(100),
  sr_employees   TEXT,
  sr_emails      TEXT,
  sr_pm_tasks    TEXT,
  sr_pic1        TEXT,
  sr_pic2        TEXT,
  sr_capt1       VARCHAR(200),
  sr_capt2       VARCHAR(200),
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sr_hours (
  sh_id    SERIAL PRIMARY KEY,
  sr_id    INT REFERENCES service_reports(sr_id),
  cnt_id   INT REFERENCES contacts(cnt_id),
  hr_type  SMALLINT,
  time_in  BIGINT,
  time_out BIGINT
);

CREATE TABLE IF NOT EXISTS sr_parts (
  sp_id     SERIAL PRIMARY KEY,
  sr_id     INT REFERENCES service_reports(sr_id),
  part_id   INT,
  sp_qty    NUMERIC(10,2),
  sp_billed BOOLEAN DEFAULT FALSE,
  sp_reason TEXT
);

CREATE TABLE IF NOT EXISTS sr_equips (
  se_id       SERIAL PRIMARY KEY,
  sr_id       INT REFERENCES service_reports(sr_id),
  subeqp_id   INT REFERENCES sub_equipment(subeqp_id),
  se_selected BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS time_entries (
  te_id    SERIAL PRIMARY KEY,
  cnt_id   INT REFERENCES contacts(cnt_id),
  te_date  DATE DEFAULT CURRENT_DATE,
  te_name  VARCHAR(50),
  te_type  SMALLINT,
  time_in  BIGINT,
  time_out BIGINT
);

CREATE INDEX IF NOT EXISTS idx_tickets_status   ON tickets(tkt_status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(tkt_assigned);
CREATE INDEX IF NOT EXISTS idx_tn_tkt           ON ticket_notifications(tkt_id);
CREATE INDEX IF NOT EXISTS idx_sr_tkt           ON service_reports(tkt_id);
CREATE INDEX IF NOT EXISTS idx_parts_tkt        ON parts(tkt_id);
CREATE INDEX IF NOT EXISTS idx_tc_cnt_date      ON time_entries(cnt_id, te_date);
