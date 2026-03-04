const router = require('express').Router();
const { getDB } = require('../db');
const { auth } = require('../middleware/auth');

// Middleware: admin only
function adminOnly(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admin access required' });
  next();
}

// GET /api/admin/users - list all users
router.get('/users', auth, adminOnly, (req, res) => {
  const db = getDB();
  const users = db.prepare(`
    SELECT u.id, u.username, u.email, u.avatar, u.is_admin, u.created_at,
           COUNT(p.id) AS post_count
    FROM users u
    LEFT JOIN posts p ON p.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at ASC
  `).all();
  res.json(users);
});

// DELETE /api/admin/users/:id - delete a user (admin cannot delete themselves)
router.delete('/users/:id', auth, adminOnly, (req, res) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  const db = getDB();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
  res.json({ ok: true });
});

module.exports = router;
