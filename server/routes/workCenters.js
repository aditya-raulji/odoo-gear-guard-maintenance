const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all work centers
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wc.*, c.name as company_name
       FROM work_centers wc
       LEFT JOIN companies c ON wc.company_id = c.id
       ORDER BY wc.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get work centers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get work center by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM work_centers WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get work center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create work center
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      code,
      company_id,
      cost,
      cost_per_hour,
      capacity,
      daily_target,
      work_rate
    } = req.body;

    const result = await pool.query(
      `INSERT INTO work_centers (
        name, code, company_id, cost, cost_per_hour,
        capacity, daily_target, work_rate, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [name, code, company_id || 1, cost || 0, cost_per_hour || 0, capacity || 1, daily_target || 8, work_rate || 1]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create work center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update work center
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      code,
      company_id,
      cost,
      cost_per_hour,
      capacity,
      daily_target,
      work_rate
    } = req.body;

    const result = await pool.query(
      `UPDATE work_centers SET
        name = $1,
        code = $2,
        company_id = $3,
        cost = $4,
        cost_per_hour = $5,
        capacity = $6,
        daily_target = $7,
        work_rate = $8,
        hourly_rate = CASE WHEN $8 > 0 THEN $5 / $8 ELSE 0 END,
        updated_at = NOW()
      WHERE id = $9 RETURNING *`,
      [name, code, company_id, cost, cost_per_hour, capacity, daily_target, work_rate, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update work center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete work center
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM work_centers WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Work center not found' });
    }

    res.json({ message: 'Work center deleted successfully' });
  } catch (error) {
    console.error('Delete work center error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

