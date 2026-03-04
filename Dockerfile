# ─── Stage 1: Build frontend ─────────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci --silent

COPY client/ ./
RUN npm run build

# ─── Stage 2: Production image ───────────────────────────────────────────────
FROM node:22-alpine AS production

# Set timezone
ENV TZ=UTC \
    NODE_ENV=production \
    PORT=3001

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev --silent

# Copy server source
COPY server/ ./

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/client/dist ./public

# Override static path to serve from /app/public
ENV STATIC_PATH=/app/public

# Override DB path via env so the DB lives in the volume
ENV DB_PATH=/app/data/donelist.db

# Run as non-root user — create data dir first so volume mount inherits permissions
RUN addgroup -S donelist && adduser -S donelist -G donelist && \
    mkdir -p /app/data && \
    chown -R donelist:donelist /app
USER donelist

EXPOSE 3001
CMD ["node", "index.js"]
