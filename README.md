# ✦ DoneList

**Share what you accomplished today.** A beautiful dark-themed social app for daily wins.

---

## Features

| | |
|---|---|
| 🔐 | JWT-based login — first registered user becomes **admin** |
| 👥 | Admin can create and delete user accounts |
| ✍️ | Post what you did today with a mood tag (🚀 Great / 😊 Good / 😐 Okay / 😴 Tired / 😞 Rough) |
| 🔥 | Like others' posts |
| 🖼 | Update your avatar via any image URL |
| 🔑 | Change your password (current password required) |
| ⚡ | Admin panel: user list with post count, create / delete accounts |
| 🌙 | Dark-mode UI |

## Tech Stack

- **Backend**: Node.js 22 + Express 5 + SQLite (`better-sqlite3`) + JWT (`jsonwebtoken`) + `bcryptjs`
- **Frontend**: React 19 + Vite 7 + Tailwind CSS 4
- **Container**: Docker (multi-stage Alpine image, ~200 MB) + Docker Compose

---

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | — | Healthcheck |
| `GET` | `/api/auth/status` | — | `{initialized}` — false if no users exist yet |
| `POST` | `/api/auth/register` | Admin JWT (except first call) | Create user account |
| `POST` | `/api/auth/login` | — | Login → JWT |
| `PATCH` | `/api/auth/avatar` | JWT | Update own avatar URL |
| `PATCH` | `/api/auth/password` | JWT | Change own password |
| `GET` | `/api/posts` | — | Public feed (newest first) |
| `POST` | `/api/posts` | JWT | Create a post |
| `POST` | `/api/posts/:id/like` | JWT | Toggle like |
| `DELETE` | `/api/posts/:id` | JWT (own post) | Delete a post |
| `GET` | `/api/admin/users` | Admin JWT | List all users |
| `DELETE` | `/api/admin/users/:id` | Admin JWT | Delete user + all their posts |

---

## Development

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2a. Run both at once (from repo root)
npm run dev        # server :3001  client :5173

# 2b. Or separately
cd server && npm run dev   # http://localhost:3001
cd client && npm run dev   # http://localhost:5173  (proxies /api → :3001)
```

Environment variables (server, all optional):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | HTTP port |
| `JWT_SECRET` | `donelist_super_secret_jwt_key_2024` | **Change in production** |
| `DB_PATH` | `server/donelist.db` | SQLite file path |
| `STATIC_PATH` | `../client/dist` | Built frontend directory |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS allowed origin |

---

## Production (without Docker)

```bash
# Build frontend
npm run build         # → client/dist/

# Start server (serves API + static frontend on one port)
npm run start         # http://localhost:3001
```

### CDN / Reverse-proxy caching

The server sets HTTP cache headers automatically:

| Content | `Cache-Control` | Rationale |
|---------|-----------------|-----------|
| `/assets/*.js`, `/assets/*.css`, images | `public, max-age=31536000, immutable` | Vite fingerprints filenames on every build — safe to cache for 1 year |
| `index.html` | `no-cache, no-store, must-revalidate` | Must always be fresh so the browser picks up new asset hashes |
| `/api/*` | _(no header set)_ | Dynamic — do **not** cache at the CDN layer |

If you put Nginx / Cloudflare / another CDN in front, make sure it:
- **Respects** the `Cache-Control` headers above (don't override them)
- **Does not cache** paths matching `/api/*`
- **Passes** the `Authorization` header through to the origin

Example minimal Nginx location block:

```nginx
location /api/ {
    proxy_pass         http://localhost:3001;
    proxy_set_header   Host $host;
    proxy_set_header   Authorization $http_authorization;
    add_header         Cache-Control "no-store" always;
}

location / {
    proxy_pass         http://localhost:3001;
    proxy_set_header   Host $host;
    # Let Express set Cache-Control — don't add your own here
}
```

---

## Docker

### Quick start

```bash
# Build image and start container
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The app will be available at **http://localhost:3001**.  
On first visit, go to `/login` — you'll be prompted to create the admin account.

### Environment variables

Set them in a `.env` file next to `docker-compose.yml` (never commit this file):

```env
JWT_SECRET=replace_with_a_long_random_string
```

Or pass inline:

```bash
JWT_SECRET=my_secret docker compose up -d
```

### Data persistence

SQLite is stored in a named Docker volume (`donelist_data`).  
The database survives container restarts and image rebuilds.

```bash
# Inspect the volume
docker volume inspect donelist_donelist_data

# Backup the database
docker run --rm \
  -v donelist_donelist_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/donelist-backup.tar.gz -C /data .

# Restore
docker run --rm \
  -v donelist_donelist_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/donelist-backup.tar.gz -C /data
```

### Rebuild after code changes

```bash
docker compose build
docker compose up -d
```

The named volume is untouched by rebuilds — your data is safe.

### Expose on a different port

Edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3001"   # host:container
```

Or override at runtime:

```bash
PORT_HOST=8080 docker compose up -d
```

(Requires changing the compose file's port mapping to `"${PORT_HOST:-3001}:3001"`.)

