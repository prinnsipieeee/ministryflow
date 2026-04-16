const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt:', email); // para makita sa terminal

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    console.log('User found:', rows.length); // dapat 1

    if (rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const user = rows[0];

    console.log('Stored hash:', user.password); // makikita ang hash

    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('Password match:', isMatch); // dapat true

    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, team_id: user.team_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team_id: user.team_id
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;