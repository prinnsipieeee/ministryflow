const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET all users
router.get('/', auth, async (req, res) => {
  try {
    // Binago natin ang 'username' sa 'email' base sa DB mo
    const [rows] = await db.query('SELECT id, name, email, role FROM users'); 
    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE user
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// REGISTER user (if not yet in your auth routes)
router.post('/register', auth, async (req, res) => {
  const { name, email, password, role } = req.body; // 'email' din dito
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    await db.query(query, [name, email, hashedPassword, role || 'admin']);
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

module.exports = router;