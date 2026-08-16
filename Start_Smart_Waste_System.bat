@echo off
title Smart Waste Management System - Ahmedabad Smart City
echo ====================================================================
echo  SMART WASTE MANAGEMENT & ROUTE OPTIMIZATION SYSTEM
echo ====================================================================
echo  Checking Python environment and dependencies...
echo ====================================================================

cd /d "%~dp0"

:: Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    py --version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Python 3 is not detected on your system PATH!
        echo You can still use the web application in standalone mode:
        echo Opening frontend\index.html directly in your default browser...
        start "" "%~dp0frontend\index.html"
        pause
        exit /b 1
    )
)

:: Ensure dependencies are installed
echo Installing / verifying required Python packages...
pip install -r requirements.txt --quiet --disable-pip-version-check

echo ====================================================================
echo  Launching Flask REST API & Web Dashboard at http://127.0.0.1:5000
echo ====================================================================

python app.py
if %ERRORLEVEL% NEQ 0 (
    echo Attempting launch with 'py app.py'...
    py app.py
)

pause
