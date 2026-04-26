FROM node:20-alpine

WORKDIR /app

# Install OpenSSL — required by Prisma schema engine on Alpine
RUN apk add --no-cache openssl

# v1.1.0 — requests+support+migration-sql
# Copy ALL files first (including prisma/schema.prisma needed by postinstall)
COPY . .

# Install deps — postinstall (prisma generate) can now find the schema
RUN npm ci

# Build: prisma generate + nest build (v1.1.0 — requests+support)
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "echo '>>> Starting migration...' && npx prisma migrate deploy && echo '>>> Migration done. Starting app...' && node dist/src/main"]
