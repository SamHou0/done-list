const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { SECRET, auth } = require('../middleware/auth');

function makeToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, avatar: user.avatar, is_admin: !!user.is_admin },
    SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/register
 * - If no users exist yet: creates the first user as admin (no auth required)
 * - Otherwise: requires a valid admin JWT
 */
router.post('/register', async (req, res) => {
  const db = getDB();
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Check whether any user exists
  const hasUsers = db.prepare('SELECT 1 FROM users LIMIT 1').get();

  if (hasUsers) {
    // Must be an authenticated admin
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Only an admin can create new accounts' });
    }
    let payload;
    try {
      payload = jwt.verify(header.slice(7), SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    if (!payload.is_admin) {
      return res.status(403).json({ error: 'Only an admin can create new accounts' });
    }
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    return res.status(409).json({ error: 'Username or email already taken' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const avatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(username)}`;
  const isAdmin = hasUsers ? 0 : 1; // first user becomes admin

  const result = db.prepare(
    'INSERT INTO users (username, email, password, avatar, is_admin) VALUES (?, ?, ?, ?, ?)'
  ).run(username, email, hashed, avatar, isAdmin);

  const user = { id: result.lastInsertRowid, username, avatar, is_admin: isAdmin };
  const token = makeToken(user);
  res.json({ token, user: { id: user.id, username, avatar, is_admin: isAdmin } });
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

  const token = makeToken(user);
  res.json({ token, user: { id: user.id, username: user.username, avatar: user.avatar, is_admin: !!user.is_admin } });
});

// GET /api/auth/status - check if any user exists (to know if setup is needed)
router.get('/status', (_req, res) => {
  const db = getDB();
  const hasUsers = !!db.prepare('SELECT 1 FROM users LIMIT 1').get();
  res.json({ initialized: hasUsers });
});

// PATCH /api/auth/avatar - update the current user's avatar URL
router.patch('/avatar', auth, (req, res) => {
  const { avatar_url } = req.body;
  if (!avatar_url || typeof avatar_url !== 'string') {
    return res.status(400).json({ error: 'avatar_url is required' });
  }
  // Basic URL validation
  try { new URL(avatar_url); } catch {
    return res.status(400).json({ error: 'avatar_url must be a valid URL' });
  }

  const db = getDB();
  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar_url.trim(), req.user.id);
  res.json({ avatar: avatar_url.trim() });
});

module.exports = router;
