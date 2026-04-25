# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDeps for build tools)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS app (compiles src/ → dist/)
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --frozen-lockfile --omit=dev

# Also install ts-node for seeding (lightweight, needed for prisma/seed.ts)
RUN npm install --no-save ts-node tslib

# Copy Prisma schema + generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Copy compiled NestJS output
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

# Security: run as non-root user
RUN addgroup -S nexora && adduser -S nexora -G nexora
RUN chown -R nexora:nexora /app
USER nexora

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
