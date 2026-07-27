@echo off
setlocal enableextensions
title Vidyaverse Pro - Launcher

REM ===========================================================================
REM  Vidyaverse Pro full-stack dev launcher
REM  Brings up Docker (MySQL 3308 + Redis 6380), applies DB migrations, then
REM  starts the backend (http://localhost:3002) and frontend (http://localhost:5173).
REM ===========================================================================

set "ROOT=%~dp0"
cd /d "%ROOT%"

echo.
echo ============================================================
echo   VIDYAVERSE PRO  -  starting full stack
echo ============================================================
echo.

REM --- 1. Docker (database + redis) ---------------------------------------
where docker >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Docker is not on PATH. Please start Docker Desktop and retry.
    pause
    exit /b 1
)

echo [1/4] Starting Docker services (vidyaverse-db, vidyaverse-redis)...
docker compose up -d
if errorlevel 1 (
    echo [ERROR] "docker compose up" failed. Is Docker Desktop running?
    pause
    exit /b 1
)

REM --- 2. Wait for MySQL to be healthy ------------------------------------
echo [2/4] Waiting for MySQL (vidyaverse-db) to become healthy...
set /a TRIES=0
:waitdb
set "DBHEALTH="
for /f "delims=" %%i in ('docker inspect -f "{{.State.Health.Status}}" vidyaverse-db 2^>nul') do set "DBHEALTH=%%i"
if /i "%DBHEALTH%"=="healthy" goto dbready
set /a TRIES+=1
if %TRIES% GEQ 45 (
    echo [ERROR] MySQL did not become healthy in time. Check: docker logs vidyaverse-db
    pause
    exit /b 1
)
echo        ... %DBHEALTH% (attempt %TRIES%/45)
timeout /t 2 /nobreak >nul
goto waitdb
:dbready
echo        MySQL is healthy.

REM --- 3. Apply migrations + generate Prisma client -----------------------
echo [3/4] Applying database migrations...
pushd "%ROOT%backend"
call npx prisma migrate deploy
if errorlevel 1 (
    echo [ERROR] prisma migrate deploy failed.
    popd
    pause
    exit /b 1
)
call npx prisma generate >nul 2>nul
popd
echo        Migrations applied.

REM --- 4. Launch backend + frontend in their own windows ------------------
echo [4/4] Launching backend (port 3002) and frontend (port 5173)...
start "Vidyaverse Backend" /D "%ROOT%backend" cmd /k "npm run dev"
start "Vidyaverse Frontend" /D "%ROOT%frontend" cmd /k "npm run dev"

echo.
echo ============================================================
echo   Vidyaverse Pro is starting up
echo ------------------------------------------------------------
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:3002
echo   API docs : http://localhost:3002/docs
echo   MySQL    : 127.0.0.1:3308   Redis : 127.0.0.1:6380
echo ------------------------------------------------------------
echo   Backend + frontend run in separate windows.
echo   Close those windows (or Ctrl+C in them) to stop the apps.
echo   To stop the database/redis:  docker compose down
echo ============================================================
echo.

REM Give the frontend a moment, then open the browser.
timeout /t 10 /nobreak >nul
start "" http://localhost:5173

endlocal
