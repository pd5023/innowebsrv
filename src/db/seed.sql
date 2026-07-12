-- Seed data: run after schema.sql
-- Test login: username = john / password = Password1

INSERT INTO clients (clt_id, clt_name, clt_main_nb, clt_siteurl, clt_lang, clt_zone)
VALUES (1, 'Demo Hospital', '(555) 100-0000', 'http://localhost:3000', 'en', 1)
ON CONFLICT (clt_id) DO NOTHING;

INSERT INTO zones (zone_id, zone_name) VALUES (1, 'Zone A'), (2, 'Zone B')
ON CONFLICT (zone_id) DO NOTHING;

INSERT INTO categories (cat_id, cat_name, clt_id) VALUES (1, 'Biomedical', 1)
ON CONFLICT (cat_id) DO NOTHING;

-- bcrypt hash of 'Password1'
INSERT INTO contacts (cnt_id, clt_id, cat_id, zone_id, name, email, phone, mobile, username, password)
VALUES (1, 1, 1, 1, 'John Doe', 'john@example.com', '(555) 100-1234', '(555) 200-5678',
        'john', '$2b$10$9sPJaJf4nkFVDXOJFQ5q8OGG.7IHKl1w2sCbVRbFSgxfT8d1W0K7.')
ON CONFLICT (username) DO NOTHING;

INSERT INTO labor_types (lt_id, clt_id, cat_id, name) VALUES
  (1, 1, 1, 'Corrective Maintenance'),
  (2, 1, 1, 'Preventive Maintenance'),
  (3, 1, 1, 'Installation')
ON CONFLICT (lt_id) DO NOTHING;

INSERT INTO modalities (modal_id, modal_name) VALUES
  (1, 'Ultrasound'),
  (2, 'MRI'),
  (3, 'CT')
ON CONFLICT (modal_id) DO NOTHING;

INSERT INTO makes (make_id, make_name) VALUES
  (1, 'GE Healthcare'),
  (2, 'Philips'),
  (3, 'Siemens')
ON CONFLICT (make_id) DO NOTHING;

INSERT INTO departments (dept_id, dept_name) VALUES
  (1, 'ICU'),
  (2, 'Cardiology'),
  (3, 'Radiology')
ON CONFLICT (dept_id) DO NOTHING;

INSERT INTO equipment (eqp_id, clt_id, dept_id, modal_id, make_id, eqp_alias, eqp_model, eqp_serial, eqp_barcode)
VALUES (1, 1, 1, 1, 1, 'ICU Ultrasound', 'Vivid S70N', 'SN-001', '00001')
ON CONFLICT (eqp_id) DO NOTHING;

INSERT INTO labor_rates (clt_id, rate_labreg, rate_trvreg, rate_labOT, rate_trvOT)
VALUES (1, 125.00, 85.00, 175.00, 110.00);

INSERT INTO tc_types (clt_id, name) VALUES
  (1, 'Drive'), (1, 'Work'), (1, 'Lunch');
