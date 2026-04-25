.PHONY: help up down build logs db-reset seed dev-backend dev-frontend

help:
	@echo ""
	@echo "  NEXORA — Makefile commands"
	@echo "  ─────────────────────────────────────────"
	@echo "  make up           Start all containers"
	@echo "  make down         Stop all containers"
	@echo "  make build        Rebuild all containers"
	@echo "  make logs         View all logs"
	@echo "  make db-reset     Reset database and reseed"
	@echo "  make seed         Run database seed"
	@echo "  make dev-backend  Start backend in dev mode"
	@echo "  make dev-frontend Start frontend in dev mode"
	@echo ""

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up -d --build

logs:
	docker compose logs -f

db-reset:
	docker compose exec backend npx prisma migrate reset --force
	docker compose exec backend npx ts-node prisma/seed.ts

seed:
	docker compose exec backend npx ts-node prisma/seed.ts

dev-backend:
	cd backend && npm install && npm run start:dev

dev-frontend:
	cd frontend && npm install && npm run dev

migrate:
	docker compose exec backend npx prisma migrate deploy

studio:
	cd backend && npx prisma studio
