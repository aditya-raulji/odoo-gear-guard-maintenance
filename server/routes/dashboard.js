const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();

    // Overdue tasks
    const overdueResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM maintenance_requests
       WHERE due_date < $1
       AND stage NOT IN ('Repaired', 'Scrap')`,
      [now]
    );

    // Upcoming tasks (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM maintenance_requests
       WHERE scheduled_date BETWEEN $1 AND $2
       AND stage NOT IN ('Repaired', 'Scrap')`,
      [now, nextWeek]
    );

    // Completed tasks
    const completedResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM maintenance_requests
       WHERE stage = 'Repaired'`
    );

    // Total equipment
    const equipmentResult = await pool.query(
      'SELECT COUNT(*) as count FROM equipment'
    );

    // Total teams
    const teamsResult = await pool.query(
      'SELECT COUNT(*) as count FROM maintenance_teams'
    );

    res.json({
      overdue_tasks: parseInt(overdueResult.rows[0].count),
      upcoming_tasks: parseInt(upcomingResult.rows[0].count),
      completed_tasks: parseInt(completedResult.rows[0].count),
      total_equipment: parseInt(equipmentResult.rows[0].count),
      total_teams: parseInt(teamsResult.rows[0].count),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent tasks for dashboard
router.get('/tasks', auth, async (req, res) => {
  try {
    const { status } = req.query; // overdue, upcoming, completed

    let query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number,
        u.name as assigned_to_name,
        u.email as assigned_to_email
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN users u ON mr.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];
    const now = new Date();

    if (status === 'overdue') {
      query += ` AND mr.due_date < $1 AND mr.stage NOT IN ('Repaired', 'Scrap')`;
      params.push(now);
    } else if (status === 'upcoming') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      query += ` AND mr.scheduled_date BETWEEN $1 AND $2 AND mr.stage NOT IN ('Repaired', 'Scrap')`;
      params.push(now, nextWeek);
    } else if (status === 'completed') {
      query += ` AND mr.stage = 'Repaired'`;
    }

    query += ' ORDER BY mr.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);

    // Mark overdue
    const tasks = result.rows.map(task => {
      const isOverdue = task.due_date && new Date(task.due_date) < now && 
                       !['Repaired', 'Scrap'].includes(task.stage);
      return { ...task, is_overdue: isOverdue };
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get dashboard tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports data for pivot/graph
router.get('/reports', auth, async (req, res) => {
  try {
    const { group_by } = req.query; // team, category

    let query;
    if (group_by === 'team') {
      query = `
        SELECT 
          mt.name as group_name,
          COUNT(*) as request_count,
          COUNT(CASE WHEN mr.stage = 'Repaired' THEN 1 END) as completed_count,
          COUNT(CASE WHEN mr.stage NOT IN ('Repaired', 'Scrap') THEN 1 END) as open_count
        FROM maintenance_requests mr
        LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
        GROUP BY mt.id, mt.name
        ORDER BY request_count DESC
      `;
    } else if (group_by === 'category') {
      query = `
        SELECT 
          ec.name as group_name,
          COUNT(*) as request_count,
          COUNT(CASE WHEN mr.stage = 'Repaired' THEN 1 END) as completed_count,
          COUNT(CASE WHEN mr.stage NOT IN ('Repaired', 'Scrap') THEN 1 END) as open_count
        FROM maintenance_requests mr
        LEFT JOIN equipment e ON mr.equipment_id = e.id
        LEFT JOIN equipment_categories ec ON e.category_id = ec.id
        GROUP BY ec.id, ec.name
        ORDER BY request_count DESC
      `;
    } else {
      return res.status(400).json({ message: 'Invalid group_by parameter' });
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

