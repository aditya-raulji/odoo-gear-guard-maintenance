const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all maintenance requests
router.get('/', auth, async (req, res) => {
  try {
    const { stage, team_id, equipment_id, type } = req.query;
    
    let query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number,
        ec.name as category_name,
        u1.name as assigned_by_name,
        u2.name as assigned_to_name,
        u2.email as assigned_to_email,
        mt.name as team_name,
        wc.name as work_center_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN users u1 ON mr.assigned_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN work_centers wc ON mr.work_center_id = wc.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (stage) {
      query += ` AND mr.stage = $${paramCount++}`;
      params.push(stage);
    }
    if (team_id) {
      query += ` AND mr.team_id = $${paramCount++}`;
      params.push(team_id);
    }
    if (equipment_id) {
      query += ` AND mr.equipment_id = $${paramCount++}`;
      params.push(equipment_id);
    }
    if (type) {
      query += ` AND mr.type = $${paramCount++}`;
      params.push(type);
    }

    query += ' ORDER BY mr.created_at DESC';

    const result = await pool.query(query, params);
    
    // Mark overdue requests
    const now = new Date();
    const requests = result.rows.map(request => {
      const isOverdue = request.due_date && new Date(request.due_date) < now && 
                       !['Repaired', 'Scrap'].includes(request.stage);
      return { ...request, is_overdue: isOverdue };
    });

    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get request by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number,
        ec.name as category_name,
        u1.name as assigned_by_name,
        u2.name as assigned_to_name,
        mt.name as team_name,
        wc.name as work_center_name
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN users u1 ON mr.assigned_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN work_centers wc ON mr.work_center_id = wc.id
      WHERE mr.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create maintenance request
router.post('/', auth, async (req, res) => {
  try {
    const {
      task_name,
      type,
      subject,
      equipment_id,
      assigned_by,
      assigned_to,
      due_date,
      scheduled_date,
      priority,
      stage,
      team_id,
      work_center_id,
      maintenance_type,
      duration,
      frequency
    } = req.body;

    // Auto-fill logic: if equipment is selected, get category and team
    let category_id = null;
    let final_team_id = team_id;
    let final_maintenance_type = maintenance_type;

    if (equipment_id) {
      const equipmentResult = await pool.query(
        'SELECT category_id, maintenance_team_id FROM equipment WHERE id = $1',
        [equipment_id]
      );

      if (equipmentResult.rows.length > 0) {
        const equipment = equipmentResult.rows[0];
        category_id = equipment.category_id;
        if (!final_team_id) {
          final_team_id = equipment.maintenance_team_id;
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO maintenance_requests (
        task_name, type, subject, equipment_id, assigned_by, assigned_to,
        due_date, scheduled_date, priority, stage, team_id, work_center_id,
        maintenance_type, duration, frequency, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      RETURNING *`,
      [
        task_name, type, subject, equipment_id, assigned_by || req.user.id, assigned_to,
        due_date, scheduled_date, priority, stage || 'New', final_team_id, work_center_id,
        final_maintenance_type, duration, frequency
      ]
    );

    // If scrapped, log equipment status
    if (stage === 'Scrap' && equipment_id) {
      await pool.query(
        'UPDATE equipment SET is_scrapped = true, scrapped_at = NOW() WHERE id = $1',
        [equipment_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update maintenance request
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      task_name,
      type,
      subject,
      equipment_id,
      assigned_to,
      due_date,
      scheduled_date,
      priority,
      stage,
      team_id,
      work_center_id,
      maintenance_type,
      duration,
      frequency,
      hours_spent
    } = req.body;

    // Get current request to check stage change
    const currentRequest = await pool.query(
      'SELECT stage, equipment_id FROM maintenance_requests WHERE id = $1',
      [req.params.id]
    );

    const oldStage = currentRequest.rows[0]?.stage;
    const equipmentId = equipment_id || currentRequest.rows[0]?.equipment_id;

    const result = await pool.query(
      `UPDATE maintenance_requests SET
        task_name = $1,
        type = $2,
        subject = $3,
        equipment_id = $4,
        assigned_to = $5,
        due_date = $6,
        scheduled_date = $7,
        priority = $8,
        stage = $9,
        team_id = $10,
        work_center_id = $11,
        maintenance_type = $12,
        duration = $13,
        frequency = $14,
        hours_spent = COALESCE($15, hours_spent),
        updated_at = NOW()
      WHERE id = $16 RETURNING *`,
      [
        task_name, type, subject, equipment_id, assigned_to, due_date,
        scheduled_date, priority, stage, team_id, work_center_id,
        maintenance_type, duration, frequency, hours_spent, req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Handle scrap logic
    if (stage === 'Scrap' && oldStage !== 'Scrap' && equipmentId) {
      await pool.query(
        'UPDATE equipment SET is_scrapped = true, scrapped_at = NOW() WHERE id = $1',
        [equipmentId]
      );
    } else if (oldStage === 'Scrap' && stage !== 'Scrap' && equipmentId) {
      await pool.query(
        'UPDATE equipment SET is_scrapped = false, scrapped_at = NULL WHERE id = $1',
        [equipmentId]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete maintenance request
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM maintenance_requests WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

