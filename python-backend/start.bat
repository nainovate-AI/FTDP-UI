@echo off
REM FastAPI CSV Preview Server - Windows Batch Startup Script
REM This script starts the Python FastAPI server for CSV file preview

echo.
echo 🎯 FastAPI CSV Preview Server
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.11+ and try again
    pause
    exit /b 1
)

REM Check if uv is available
uv --version >nul 2>&1
if errorlevel 1 (
    echo ❌ uv is not installed
    echo Installing uv...
    pip install uv
    if errorlevel 1 (
        echo ❌ Failed to install uv
        pause
        exit /b 1
    )
)

echo ✅ Python and uv are available
echo.

REM Run the startup script
echo 🚀 Starting server...
python start.py

pause
