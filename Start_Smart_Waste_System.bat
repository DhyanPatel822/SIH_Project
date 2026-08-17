@echo off
title Smart Waste Management System
echo ====================================================================
echo  SMART WASTE MANAGEMENT & ROUTE OPTIMIZATION SYSTEM
echo ====================================================================
echo  Starting application...
echo ====================================================================

python app.py

if errorlevel 1 (
    py app.py
)

pause
