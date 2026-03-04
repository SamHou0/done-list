const router = require('express').Router();
const { getDB } = require('../db');
const { auth } = require('../middleware/auth');

const MOODS = ['great', 'good', 'neutral', 'tired', 'bad'];

// Get all posts (public feed)
router.get('/', (req, res) => {
  const db = getDB();
  const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;

  const posts = db.prepare(`
    SELECT
      p.id, p.content, p.mood, p.created_at,
      u.username, u.avatar,
      COUNT(DISTINCT l.user_id) AS like_count,
      ${userId ? 'MAX(CASE WHEN l2.user_id = ? THEN 1 ELSE 0 END)' : '0'} AS liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON l.post_id = p.id
    ${userId ? 'LEFT JOIN likes l2 ON l2.post_id = p.id AND l2.user_id = ?' : ''}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 100
  `).all(...(userId ? [userId, userId] : []));

  res.json(posts);
});

// Create post
router.post('/', auth, (req, res) => {
  const { content, mood } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }
  if (content.length > 500) {
    return res.status(400).json({ error: 'Content too long (max 500 characters)' });
  }
  const validMood = MOODS.includes(mood) ? mood : 'neutral';

  const db = getDB();
  const result = db.prepare(
    'INSERT INTO posts (user_id, content, mood) VALUES (?, ?, ?)'
  ).run(req.user.id, content.trim(), validMood);

  const post = db.prepare(`
    SELECT p.id, p.content, p.mood, p.created_at,
           u.username, u.avatar,
           0 AS like_count, 0 AS liked
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(post);
});

// Toggle like
router.post('/:id/like', auth, (req, res) => {
  const db = getDB();
  const postId = parseInt(req.params.id);
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?').get(req.user.id, postId);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(req.user.id, postId);
  } else {
    db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(req.user.id, postId);
  }

  const { like_count } = db.prepare('SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?').get(postId);
  res.json({ liked: !existing, like_count });
});

// Delete post
router.delete('/:id', auth, (req, res) => {
  const db = getDB();
  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  db.prepare('DELETE FROM posts WHERE id = ?').run(parseInt(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
