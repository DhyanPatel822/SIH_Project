#!/usr/bin/env bash
# ====================================================================
# Smart Waste Management & Route Optimization System Launcher
# Compatible with Linux / macOS / WSL
# ====================================================================

set -e
cd "$(dirname "$0")"

echo "================================================================="
echo " SMART WASTE MANAGEMENT & ROUTE OPTIMIZATION SYSTEM"
echo "================================================================="

if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "[ERROR] Python 3 is not installed or not in PATH."
        echo "Opening standalone client engine in default browser..."
        if command -v xdg-open &> /dev/null; then
            xdg-open frontend/index.html
        elif command -v open &> /dev/null; then
            open frontend/index.html
        fi
        exit 1
    else
        PYTHON_CMD=python
    fi
else
    PYTHON_CMD=python3
fi

echo "Installing/verifying required dependencies..."
$PYTHON_CMD -m pip install -r requirements.txt --quiet --disable-pip-version-check

echo "Starting server on http://127.0.0.1:5000 ..."
$PYTHON_CMD app.py
