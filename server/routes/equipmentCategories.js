const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all equipment categories
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ec.*, 
        u.name as responsible_name,
        c.name as company_name
      FROM equipment_categories ec
      LEFT JOIN users u ON ec.responsible_id = u.id
      LEFT JOIN companies c ON ec.company_id = c.id
      ORDER BY ec.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM equipment_categories WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category
router.post('/', auth, async (req, res) => {
  try {
    const { name, responsible_id, company_id, description } = req.body;

    const result = await pool.query(
      `INSERT INTO equipment_categories (name, responsible_id, company_id, description, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [name, responsible_id, company_id || 1, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, responsible_id, company_id, description } = req.body;

    const result = await pool.query(
      `UPDATE equipment_categories SET
        name = $1,
        responsible_id = $2,
        company_id = $3,
        description = $4,
        updated_at = NOW()
      WHERE id = $5 RETURNING *`,
      [name, responsible_id, company_id, description, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM equipment_categories WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

