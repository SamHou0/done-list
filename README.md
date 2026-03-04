# ✦ DoneList

**Share what you accomplished today.** A beautiful dark-themed social app for daily wins.

## Features

- 🔐 User registration & login (JWT auth)
- ✍️ Post what you did today with a mood tag
- 🔥 Like others' posts
- 🌙 Dark mode UI

## Tech Stack

- **Backend**: Node.js + Express + SQLite (better-sqlite3) + JWT
- **Frontend**: React + Vite + Tailwind CSS

## Development

```bash
# Install deps
cd server && npm install
cd ../client && npm install

# Run both servers (requires concurrently)
npm run dev   # from root

# Or separately:
cd server && npm run dev    # http://localhost:3001
cd client && npm run dev    # http://localhost:5173
```

## Production

```bash
npm run build   # builds frontend to client/dist/
npm run start   # serves everything on port 3001
```
