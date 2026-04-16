const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Kukuha tayo ng counts mula sa iba't ibang tables
    const [[teamsCount]] = await db.query('SELECT COUNT(*) as total FROM teams');
    const [[inventoryCount]] = await db.query('SELECT COUNT(*) as total FROM inventory_items');
    const [[membersCount]] = await db.query('SELECT COUNT(*) as total FROM users');

    res.json({
      teams: teamsCount.total,
      inventory: inventoryCount.total,
      members: membersCount.total
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;