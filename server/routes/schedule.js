const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// UPDATE specific assignment (assigned_to name)
router.put('/assignments/:id', auth, async (req, res) => {
  // Linisin ang ID kung sakaling may ":" na sumama mula sa frontend request
  const cleanId = req.params.id.replace(':', ''); 
  const { assigned_to } = req.body;

  try {
    const query = 'UPDATE schedule_assignments SET assigned_to = ? WHERE id = ?';
    const [result] = await db.query(query, [assigned_to, cleanId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Assignment record not found' });
    }

    res.json({ message: 'Assignment updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// GET all schedules
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM schedules ORDER BY schedule_date DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single schedule with assignments
router.get('/:id', auth, async (req, res) => {
  try {
    const [schedule] = await db.query(
      'SELECT * FROM schedules WHERE id = ?',
      [req.params.id]
    );
    if (schedule.length === 0)
      return res.status(404).json({ message: 'Schedule not found' });

    const [assignments] = await db.query(
      `SELECT sa.*, t.name as team_name 
       FROM schedule_assignments sa
       JOIN teams t ON sa.team_id = t.id
       WHERE sa.schedule_id = ?
       ORDER BY sa.team_id`,
      [req.params.id]
    );

    res.json({ ...schedule[0], assignments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// CREATE schedule
router.post('/', auth, async (req, res) => {
  const { service_type, schedule_date, assignments } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO schedules (service_type, schedule_date) VALUES (?,?)',
      [service_type, schedule_date]
    );
    const scheduleId = result.insertId;

    if (assignments && assignments.length > 0) {
      for (const a of assignments) {
        await db.query(
          'INSERT INTO schedule_assignments (schedule_id, team_id, role_name, assigned_to, notes) VALUES (?,?,?,?,?)',
          [scheduleId, a.team_id, a.role_name, a.assigned_to || '', a.notes || '']
        );
      }
    }

    res.json({ message: 'Schedule created', id: scheduleId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE assignment
router.put('/assignment/:id', auth, async (req, res) => {
  const { assigned_to, notes } = req.body;
  try {
    await db.query(
      'UPDATE schedule_assignments SET assigned_to=?, notes=? WHERE id=?',
      [assigned_to, notes, req.params.id]
    );
    res.json({ message: 'Assignment updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE schedule
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET color codes
router.get('/colorcodes/all', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cc.*, t.name as team_name 
       FROM color_codes cc JOIN teams t ON cc.team_id = t.id
       ORDER BY cc.team_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ADD/UPDATE color code
router.post('/colorcodes', auth, async (req, res) => {
  const { team_id, service_type, color_code, description } = req.body;
  try {
    await db.query(
      `INSERT INTO color_codes (team_id, service_type, color_code, description)
       VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE color_code=?, description=?`,
      [team_id, service_type, color_code, description, color_code, description]
    );
    res.json({ message: 'Color code saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;