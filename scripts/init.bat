@echo off
echo.
echo  ==============================================
echo    NEXORA — Streaming Platform
echo    Initialization Script (Windows)
echo  ==============================================
echo.

REM Check .env
if not exist ".env" (
    echo [INFO] Copying .env.example to .env ...
    copy .env.example .env
    echo [WARNING] Edit .env with your actual credentials before continuing!
    pause
    exit /b 1
)

echo [OK] .env found

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Install Docker Desktop first.
    pause
    exit /b 1
)
echo [OK] Docker found

echo.
echo [INFO] Building and starting containers...
docker compose up -d --build

echo.
echo [INFO] Waiting for database (15s)...
timeout /t 15 /nobreak >nul

echo.
echo [INFO] Running database migrations...
docker compose exec backend npx prisma migrate deploy

echo.
echo [INFO] Seeding database...
docker compose exec backend npx ts-node prisma/seed.ts

echo.
echo  ==============================================
echo    NEXORA is running!
echo  ==============================================
echo.
echo    Frontend:     http://localhost:3000
echo    Backend API:  http://localhost:4000/api/v1
echo    Swagger docs: http://localhost:4000/api/docs
echo.
echo    Admin: admin@nexora.com  /  Admin123!
echo    User:  demo@nexora.com   /  User123!
echo.
pause
