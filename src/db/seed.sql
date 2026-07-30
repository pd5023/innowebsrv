-- Seed data: run after schema.sql
-- Test login: username = john / password = Password1

INSERT INTO zones (zone_id, zone_name, zone_country, zone_time, zone_lang)
VALUES (1, 'Zone A', 'USA', 'America/New_York', 'en')
ON CONFLICT (zone_id) DO NOTHING;

INSERT INTO main_office (id, name, address, main_phone, busHrs, zone)
VALUES (1, 'Demo Main Office', '{"street":"1 Main St","city":"Anytown","state":"NY","zip":"10001"}', '(555) 100-0000', '8am-5pm', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_office (sub_id, sub_name, sub_mainId, sub_zone)
VALUES (1, 'Demo Sub Office', 1, 1)
ON CONFLICT (sub_id) DO NOTHING;

INSERT INTO role_auth (auth_id, auth_name) VALUES
  (1, 'Admin'),
  (2, 'Standard')
ON CONFLICT (auth_id) DO NOTHING;

INSERT INTO cnt_role (role_id, role_name) VALUES
  (1, 'Biomed Manager'),
  (2, 'Department Head')
ON CONFLICT (role_id) DO NOTHING;

INSERT INTO modalities (mod_id, mod_name) VALUES
  (1, 'Ultrasound'),
  (2, 'MRI'),
  (3, 'CT')
ON CONFLICT (mod_id) DO NOTHING;

INSERT INTO departments (dept_id, dept_name) VALUES
  (1, 'ICU'),
  (2, 'Cardiology'),
  (3, 'Radiology')
ON CONFLICT (dept_id) DO NOTHING;

INSERT INTO makes (make_id, make_name) VALUES
  (1, 'GE Healthcare'),
  (2, 'Philips'),
  (3, 'Siemens')
ON CONFLICT (make_id) DO NOTHING;

INSERT INTO equipment_srvcBy (srvc_id, srvc_name) VALUES
  (1, 'In-House'),
  (2, 'Vendor')
ON CONFLICT (srvc_id) DO NOTHING;

INSERT INTO equp_coverage (cov_id, cov_name) VALUES
  (1, 'Full Coverage'),
  (2, 'Parts Only')
ON CONFLICT (cov_id) DO NOTHING;

INSERT INTO part_origin (partFrom_id, partFrom_name) VALUES
  (1, 'OEM'),
  (2, 'Aftermarket')
ON CONFLICT (partFrom_id) DO NOTHING;

INSERT INTO part_status (partStat_id, partStat_name) VALUES
  (1, 'Ordered'),
  (2, 'Received'),
  (3, 'Installed')
ON CONFLICT (partStat_id) DO NOTHING;

INSERT INTO tkt_status (tkt_statId, tkt_statName) VALUES
  (1, 'Open'),
  (2, 'In Progress'),
  (3, 'Closed')
ON CONFLICT (tkt_statId) DO NOTHING;

INSERT INTO sr_status (stat_id, stat_name) VALUES
  (1, 'Scheduled'),
  (2, 'Completed')
ON CONFLICT (stat_id) DO NOTHING;

INSERT INTO labor_rates (rate_id, rate_effDate, rate_detail)
VALUES (1, NOW(), '{"labor_reg":125.00,"travel_reg":85.00,"labor_ot":175.00,"travel_ot":110.00}')
ON CONFLICT (rate_id) DO NOTHING;

INSERT INTO clients (clt_id, clt_name, clt_address, clt_phone, clt_siteurl, clt_zone, clt_subId)
VALUES (1, 'Demo Hospital', '{"street":"100 Health Way","city":"Anytown","state":"NY","zip":"10001"}', '(555) 100-0000', 'http://localhost:3000', 1, 1)
ON CONFLICT (clt_id) DO NOTHING;

INSERT INTO client_depts (cltDept_id, cltDept_cltId, cltDept_dept, cltDept_alias)
VALUES (1, 1, 1, 'ICU')
ON CONFLICT (cltDept_id) DO NOTHING;

INSERT INTO contacts (cnt_id, cnt_cltId, cnt_deptId, cnt_name, cnt_email, cnt_phone, cnt_auth)
VALUES (1, 1, 1, 'Jane Contact', 'jane@example.com', '(555) 200-5678', 1)
ON CONFLICT (cnt_id) DO NOTHING;

-- bcrypt hash of 'Password1'
INSERT INTO employees (empl_id, empl_subId, empl_name, empl_email, empl_phone, empl_username, empl_password, empl_clientPrim, empl_cats, empl_role, empl_isActive)
VALUES (1, 1, 'John Doe', 'john@example.com', '(555) 100-1234', 'john',
        '$2b$10$9sPJaJf4nkFVDXOJFQ5q8OGG.7IHKl1w2sCbVRbFSgxfT8d1W0K7.',
        '1', '[1,2,3]', 'admin', TRUE)
ON CONFLICT (empl_id) DO NOTHING;

INSERT INTO equipments (eqp_id, eqp_cltId, eqp_deptId, eqp_modalId, eqp_makeId, eqp_alias, eqp_model, eqp_serial, eqp_barcode)
VALUES (1, 1, 1, 1, 1, 'ICU Ultrasound', 'Vivid S70N', 'SN-001', '00001')
ON CONFLICT (eqp_id) DO NOTHING;
