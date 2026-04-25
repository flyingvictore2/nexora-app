#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Nexora — Initialization Script
# ──────────────────────────────────────────────────────────────
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "  ███╗   ██╗███████╗██╗  ██╗ ██████╗ ██████╗  █████╗ "
echo "  ████╗  ██║██╔════╝╚██╗██╔╝██╔═══██╗██╔══██╗██╔══██╗"
echo "  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║██████╔╝███████║"
echo "  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║██╔══██╗██╔══██║"
echo "  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝██║  ██║██║  ██║"
echo "  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
echo -e "${NC}"
echo "  Streaming Platform — Initialization Script"
echo ""

# Check .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}→ Copying .env.example to .env${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  Please edit .env with your actual credentials before continuing!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env found${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed. Please install Docker Desktop.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo -e "${RED}✗ Docker Compose is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"

echo ""
echo -e "${YELLOW}→ Building and starting containers...${NC}"
docker compose up -d --build

echo ""
echo -e "${YELLOW}→ Waiting for database to be ready...${NC}"
sleep 15

echo ""
echo -e "${YELLOW}→ Running database migrations...${NC}"
docker compose exec backend npx prisma migrate deploy || true

echo ""
echo -e "${YELLOW}→ Seeding database with sample data...${NC}"
docker compose exec backend npx ts-node prisma/seed.ts || \
docker compose exec backend node -e "require('./dist/prisma/seed')" || true

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎬 Nexora is running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "  Frontend:     http://localhost:3000"
echo "  Backend API:  http://localhost:4000/api/v1"
echo "  Swagger docs: http://localhost:4000/api/docs"
echo ""
echo "  Admin:  admin@nexora.com  /  Admin123!"
echo "  User:   demo@nexora.com   /  User123!"
echo ""
