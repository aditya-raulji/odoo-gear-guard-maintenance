const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all maintenance teams
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        mt.*,
        c.name as company_name,
        COALESCE(
          json_agg(
            json_build_object('id', u.id, 'name', u.name) 
            ORDER BY u.name
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'::json
        ) as members,
        (SELECT COUNT(*) FROM maintenance_requests 
         WHERE team_id = mt.id AND stage NOT IN ('Repaired', 'Scrap')) as request_count
      FROM maintenance_teams mt
      LEFT JOIN companies c ON mt.company_id = c.id
      LEFT JOIN maintenance_team_members mtm ON mt.id = mtm.team_id
      LEFT JOIN users u ON mtm.user_id = u.id
      GROUP BY mt.id, c.name
      ORDER BY mt.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const teamResult = await pool.query(
      'SELECT * FROM maintenance_teams WHERE id = $1',
      [req.params.id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM users u
       INNER JOIN maintenance_team_members mtm ON u.id = mtm.user_id
       WHERE mtm.team_id = $1`,
      [req.params.id]
    );

    const team = teamResult.rows[0];
    team.members = membersResult.rows;

    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create team
router.post('/', auth, async (req, res) => {
  try {
    const { name, company_id, member_ids } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const teamResult = await client.query(
        `INSERT INTO maintenance_teams (name, company_id, created_at)
         VALUES ($1, $2, NOW()) RETURNING *`,
        [name, company_id || 1]
      );

      const team = teamResult.rows[0];

      if (member_ids && member_ids.length > 0) {
        for (const memberId of member_ids) {
          await client.query(
            'INSERT INTO maintenance_team_members (team_id, user_id) VALUES ($1, $2)',
            [team.id, memberId]
          );
        }
      }

      await client.query('COMMIT');

      res.status(201).json(team);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, company_id, member_ids } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const teamResult = await client.query(
        `UPDATE maintenance_teams SET
          name = $1,
          company_id = $2,
          updated_at = NOW()
        WHERE id = $3 RETURNING *`,
        [name, company_id, req.params.id]
      );

      if (teamResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Team not found' });
      }

      // Update members
      await client.query(
        'DELETE FROM maintenance_team_members WHERE team_id = $1',
        [req.params.id]
      );

      if (member_ids && member_ids.length > 0) {
        for (const memberId of member_ids) {
          await client.query(
            'INSERT INTO maintenance_team_members (team_id, user_id) VALUES ($1, $2)',
            [req.params.id, memberId]
          );
        }
      }

      await client.query('COMMIT');

      res.json(teamResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete team
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM maintenance_teams WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

