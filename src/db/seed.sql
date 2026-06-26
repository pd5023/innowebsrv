-- Seed data — run after schema.sql to get a working dev environment
-- Password for all test users is: 'Password1' (bcrypt hash below)

INSERT INTO clients (clt_name, clt_main_nb, clt_siteurl, clt_lang, clt_zone)
VALUES ('Demo Hospital', '(555) 100-0000', 'http://localhost:3000', 'en', 1)
ON CONFLICT DO NOTHING;

INSERT INTO zones (zone_name) VALUES ('Zone A'), ('Zone B') ON CONFLICT DO NOTHING;

INSERT INTO categories (cat_name, clt_id) VALUES ('Biomedical', 1) ON CONFLICT DO NOTHING;

-- bcrypt hash of 'Password1'
INSERT INTO contacts (clt_id, cat_id, zone_id, name, email, phone, mobile, username, password)
VALUES (1, 1, 1, 'John Doe', 'john@example.com', '(555) 100-1234', '(555) 200-5678',
        'john', '$2b$10$9sPJaJf4nkFVDXOJFQ5q8OGG.7IHKl1w2sCbVRbFSgxfT8d1W0K7.')
ON CONFLICT DO NOTHING;

INSERT INTO labor_types (clt_id, cat_id, name) VALUES
  (1, 1, 'Corrective Maintenance'),
  (1, 1, 'Preventive Maintenance'),
  (1, 1, 'Installation')
ON CONFLICT DO NOTHING;

INSERT INTO modalities (clt_id, cat_id, modal_name) VALUES
  (1, 1, 'Ultrasound'),
  (1, 1, 'MRI'),
  (1, 1, 'CT')
ON CONFLICT DO NOTHING;

INSERT INTO makes (clt_id, make_name) VALUES
  (1, 'GE Healthcare'),
  (1, 'Philips'),
  (1, 'Siemens')
ON CONFLICT DO NOTHING;

INSERT INTO departments (clt_id, dept_name) VALUES
  (1, 'ICU'),
  (1, 'Cardiology'),
  (1, 'Radiology')
ON CONFLICT DO NOTHING;

INSERT INTO equipment (clt_id, dept_id, modal_id, make_id, eqp_alias, eqp_model, eqp_serial, eqp_barcode)
VALUES (1, 1, 1, 1, 'ICU Ultrasound', 'Vivid S70N', 'SN-001', '00001')
ON CONFLICT DO NOTHING;

INSERT INTO labor_rates (clt_id, rate_labreg, rate_trvreg, rate_labOT, rate_trvOT)
VALUES (1, 125.00, 85.00, 175.00, 110.00)
ON CONFLICT DO NOTHING;

INSERT INTO tc_types (clt_id, name) VALUES
  (1, 'Drive'), (1, 'Work'), (1, 'Lunch')
ON CONFLICT DO NOTHING;
