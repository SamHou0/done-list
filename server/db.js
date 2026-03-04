const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'donelist.db');
let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT UNIQUE NOT NULL,
      email     TEXT UNIQUE NOT NULL,
      password  TEXT NOT NULL,
      avatar    TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content    TEXT NOT NULL,
      mood       TEXT DEFAULT 'neutral',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id  INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, post_id)
    );
  `);

  console.log('Database initialized');
}

module.exports = { getDB, initDB };
