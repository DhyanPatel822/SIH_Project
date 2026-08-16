@echo off
title Smart Waste Management System - SIH 2026
echo ====================================================================
echo  SIH 2026 - SMART WASTE MANAGEMENT & ROUTE OPTIMIZATION SYSTEM
echo ====================================================================
echo  Starting Python Flask Backend Server & Opening Web Dashboard...
echo ====================================================================

cd /d "%~dp0"

:: Open Web Browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:5000"

:: Try running with python command
python run.py
if %ERRORLEVEL% NEQ 0 (
    echo Python command failed, trying 'py' command...
    py run.py
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start Python backend.
    echo Please make sure Python 3.x is installed and added to PATH.
    echo.
)

pause
