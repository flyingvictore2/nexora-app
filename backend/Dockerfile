FROM node:20-alpine

WORKDIR /app

# v1.1.0 — requests+support+migration-sql (cache bust: 20260426-b)
# Copy ALL files first (including prisma/schema.prisma needed by postinstall)
COPY . .

# Install deps — postinstall (prisma generate) can now find the schema
RUN npm ci

# Build: prisma generate + nest build (v1.1.0 — requests+support)
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
