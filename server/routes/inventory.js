const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all items (per team)
router.get('/:team_id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM inventory_items WHERE team_id = ?',
      [req.params.team_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ADD item
router.post('/', auth, async (req, res) => {
  const { name, category, quantity, condition_status, location, status, team_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO inventory_items (name, category, quantity, condition_status, location, status, team_id) VALUES (?,?,?,?,?,?,?)',
      [name, category, quantity, condition_status, location, status, team_id]
    );
    res.json({ message: 'Item added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE item
router.put('/:id', auth, async (req, res) => {
  const { name, category, quantity, condition_status, location, status } = req.body;
  try {
    await db.query(
      'UPDATE inventory_items SET name=?, category=?, quantity=?, condition_status=?, location=?, status=? WHERE id=?',
      [name, category, quantity, condition_status, location, status, req.params.id]
    );
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE item
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM inventory_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;