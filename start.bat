@echo off
title Vidyaverse Pro
color 0a

:: Change directory to where the batch file is located
cd /d "%~dp0"

echo ========================================================
echo                 VIDYAVERSE PRO SERVER
echo ========================================================
echo.

echo [1/3] Starting Database Server (Docker)...
call docker-compose up -d

echo.
echo [2/3] Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel run vgraphics"

echo.
echo [3/3] Starting Frontend and Backend Development Servers...
echo --------------------------------------------------------

call pnpm dev:all

echo.
echo Servers have stopped.
pause
