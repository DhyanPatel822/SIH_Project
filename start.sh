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
        echo "[INFO] Python is not detected in PATH."
        echo "Opening standalone dashboard directly in your browser..."
        if command -v xdg-open &> /dev/null; then
            xdg-open index.html
        elif command -v open &> /dev/null; then
            open index.html
        fi
        exit 0
    else
        PYTHON_CMD=python
    fi
else
    PYTHON_CMD=python3
fi

echo "Starting server on http://127.0.0.1:5000 ..."
$PYTHON_CMD app.py
