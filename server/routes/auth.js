const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { SECRET } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const db = getDB();
  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    return res.status(409).json({ error: 'Username or email already taken' });
  }

  const hashed = await bcrypt.hash(password, 10);
  // Generate a colorful avatar using DiceBear
  const avatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(username)}`;

  const result = db.prepare(
    'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)'
  ).run(username, email, hashed, avatar);

  const token = jwt.sign({ id: result.lastInsertRowid, username, avatar }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: result.lastInsertRowid, username, avatar } });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, username: user.username, avatar: user.avatar },
    SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, username: user.username, avatar: user.avatar } });
});

module.exports = router;
