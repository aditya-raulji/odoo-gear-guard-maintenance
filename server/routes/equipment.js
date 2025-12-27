const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all equipment
router.get('/', auth, async (req, res) => {
  try {
    const { department, employee, category } = req.query;
    
    let query = `
      SELECT 
        e.*,
        ec.name as category_name,
        mt.name as team_name,
        u.name as employee_name,
        d.name as department_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
      LEFT JOIN users u ON e.employee_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (department) {
      query += ` AND e.department_id = $${paramCount++}`;
      params.push(department);
    }
    if (employee) {
      query += ` AND e.employee_id = $${paramCount++}`;
      params.push(employee);
    }
    if (category) {
      query += ` AND e.category_id = $${paramCount++}`;
      params.push(category);
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get equipment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        e.*,
        ec.name as category_name,
        mt.name as team_name,
        u.name as employee_name,
        d.name as department_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
      LEFT JOIN users u ON e.employee_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Get maintenance requests count for this equipment
    const requestsResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM maintenance_requests 
       WHERE equipment_id = $1 
       AND stage NOT IN ('Repaired', 'Scrap')`,
      [req.params.id]
    );

    const equipment = result.rows[0];
    equipment.open_requests_count = parseInt(requestsResult.rows[0].count);

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create equipment
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      serial_number,
      category_id,
      department_id,
      employee_id,
      maintenance_team_id,
      location,
      purchase_date,
      warranty_date,
      type_model,
      setup_date,
      description,
      company_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO equipment (
        name, serial_number, category_id, department_id, employee_id,
        maintenance_team_id, location, purchase_date, warranty_date,
        type_model, setup_date, description, company_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *`,
      [
        name, serial_number, category_id, department_id, employee_id,
        maintenance_team_id, location, purchase_date, warranty_date,
        type_model, setup_date, description, company_id || 1
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update equipment
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      serial_number,
      category_id,
      department_id,
      employee_id,
      maintenance_team_id,
      location,
      purchase_date,
      warranty_date,
      type_model,
      setup_date,
      description
    } = req.body;

    const result = await pool.query(
      `UPDATE equipment SET
        name = $1,
        serial_number = $2,
        category_id = $3,
        department_id = $4,
        employee_id = $5,
        maintenance_team_id = $6,
        location = $7,
        purchase_date = $8,
        warranty_date = $9,
        type_model = $10,
        setup_date = $11,
        description = $12,
        updated_at = NOW()
      WHERE id = $13
      RETURNING *`,
      [
        name, serial_number, category_id, department_id, employee_id,
        maintenance_team_id, location, purchase_date, warranty_date,
        type_model, setup_date, description, req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete equipment
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM equipment WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get maintenance requests for equipment
router.get('/:id/maintenance-requests', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.*, 
        u1.name as assigned_by_name,
        u2.name as assigned_to_name,
        mt.name as team_name,
        wc.name as work_center_name
      FROM maintenance_requests mr
      LEFT JOIN users u1 ON mr.assigned_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN work_centers wc ON mr.work_center_id = wc.id
      WHERE mr.equipment_id = $1
      ORDER BY mr.created_at DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get equipment requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

