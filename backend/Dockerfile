FROM node:20-alpine

WORKDIR /app

# Copy ALL files first (including prisma/schema.prisma needed by postinstall)
COPY . .

# Install deps — postinstall (prisma generate) can now find the schema
RUN npm ci

# Build: prisma generate + nest build
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
