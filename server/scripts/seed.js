require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function ensureCompany() {
  const { rows } = await pool.query('SELECT id FROM companies LIMIT 1');
  if (rows.length) return rows[0].id;
  const result = await pool.query(
    'INSERT INTO companies (name) VALUES ($1) RETURNING id',
    ['Demo Company']
  );
  return result.rows[0].id;
}

async function ensureDepartment(companyId) {
  const { rows } = await pool.query('SELECT id FROM departments LIMIT 1');
  if (rows.length) return rows[0].id;
  const result = await pool.query(
    'INSERT INTO departments (name, company_id) VALUES ($1, $2) RETURNING id',
    ['Operations', companyId]
  );
  return result.rows[0].id;
}

async function ensureUsers() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM users');
  if (rows[0].c > 0) {
    const existing = await pool.query('SELECT id, name, email FROM users ORDER BY id ASC LIMIT 1');
    return existing.rows[0];
  }
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('admin123', salt);
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    ['Admin User', 'admin@example.com', hashed]
  );
  return result.rows[0];
}

async function ensureEquipmentCategory(responsibleId, companyId) {
  const { rows } = await pool.query('SELECT id FROM equipment_categories LIMIT 1');
  if (rows.length) return rows[0].id;
  const result = await pool.query(
    'INSERT INTO equipment_categories (name, responsible_id, company_id, description) VALUES ($1, $2, $3, $4) RETURNING id',
    ['Machines', responsibleId, companyId, 'General machinery']
  );
  return result.rows[0].id;
}

async function ensureMaintenanceTeam(companyId) {
  const { rows } = await pool.query('SELECT id FROM maintenance_teams LIMIT 1');
  if (rows.length) return rows[0].id;
  const result = await pool.query(
    'INSERT INTO maintenance_teams (name, company_id) VALUES ($1, $2) RETURNING id',
    ['Core Maintenance', companyId]
  );
  return result.rows[0].id;
}

async function ensureWorkCenter(companyId) {
  const { rows } = await pool.query('SELECT id FROM work_centers LIMIT 1');
  if (rows.length) return rows[0].id;
  const result = await pool.query(
    `INSERT INTO work_centers (name, code, company_id, cost, cost_per_hour, capacity, daily_target, work_rate, hourly_rate)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    ['Assembly Line 1', 'WC-ASM-1', companyId, 10000, 250, 1.0, 8.0, 1.0, 250]
  );
  return result.rows[0].id;
}

async function ensureEquipment(categoryId, departmentId, employeeId, teamId, companyId) {
  const { rows } = await pool.query('SELECT id FROM equipment LIMIT 1');
  if (rows.length) return rows[0].id;
  const result = await pool.query(
    `INSERT INTO equipment (name, serial_number, category_id, department_id, employee_id, maintenance_team_id, location, purchase_date, warranty_date, type_model, setup_date, description, company_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
    ['Hydraulic Press', 'HP-2024-0001', categoryId, departmentId, employeeId, teamId, 'Plant A', '2024-01-01', '2026-01-01', 'HP-X200', '2024-02-01', 'Primary press in line', companyId]
  );
  return result.rows[0].id;
}

async function ensureMaintenanceRequests(equipmentId, requestedBy) {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM maintenance_requests');
  if (rows[0].c > 0) return;
  await pool.query(
    `INSERT INTO maintenance_requests (task_name, type, subject, equipment_id, assigned_by, priority, stage, due_date, scheduled_date)
     VALUES
     ($1,'Corrective',$2,$3,$4,'High','New', NOW() + INTERVAL '7 day', NOW() + INTERVAL '3 day'),
     ($5,'Preventive',$6,$3,$4,'Medium','In Progress', NOW() + INTERVAL '14 day', NOW() + INTERVAL '10 day')`,
    [
      'Oil Leak Detected', 'Found oil leakage near the valve', equipmentId, requestedBy,
      'Monthly Check', 'Routine check of belts and lubrication'
    ]
  );
}

async function seed() {
  console.log('Seeding database...');
  await pool.query('BEGIN');
  try {
    const companyId = await ensureCompany();
    const departmentId = await ensureDepartment(companyId);
    const user = await ensureUsers();
    const categoryId = await ensureEquipmentCategory(user.id, companyId);
    const teamId = await ensureMaintenanceTeam(companyId);
    const wcId = await ensureWorkCenter(companyId);
    const equipmentId = await ensureEquipment(categoryId, departmentId, user.id, teamId, companyId);
    await ensureMaintenanceRequests(equipmentId, user.id);

    await pool.query('COMMIT');
    console.log('Seed completed successfully.');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
