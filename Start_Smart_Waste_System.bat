@echo off
title Smart Waste Management System - SIH 2026
echo ====================================================================
echo  SIH 2026 - SMART WASTE MANAGEMENT & ROUTE OPTIMIZATION SYSTEM
echo ====================================================================
echo  Starting Python Flask Backend Server & Opening Web Dashboard...
echo ====================================================================

cd /d "%~dp0"

:: Wait 2 seconds then open web browser
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5000"

:: Launch Python Backend Server
python app.py

pause
