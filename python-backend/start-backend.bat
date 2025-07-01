@echo off
REM Nainovate AI Backend Startup Script for Windows
REM This script starts both the job management API and training monitor API

echo 🚀 Starting Nainovate AI Backend Services...
echo =================================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "main.py" (
    echo ❌ Please run this script from the python-backend directory
    echo    Expected files: main.py, mock_training_api.py
    pause
    exit /b 1
)

if not exist "mock_training_api.py" (
    echo ❌ Please run this script from the python-backend directory
    echo    Expected files: main.py, mock_training_api.py
    pause
    exit /b 1
)

REM Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo 📦 Installing Python dependencies...
    python -m pip install -r requirements.txt
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

echo 🌐 Starting Job Management API on port 8000...
start "Job-Management-API" python main.py

REM Wait a moment for the first service to initialize
timeout /t 3 /nobreak >nul

echo 🌐 Starting Training Monitor API on port 8001...
start "Mock-Training-API" python mock_training_api.py

echo.
echo 🎉 Backend services started successfully!
echo =================================================
echo 📊 Job Management API:    http://localhost:8000
echo 📈 Mock Training API:     http://localhost:8001
echo.
echo 📖 Available endpoints:
echo    • Job Management:    http://localhost:8000/docs
echo    • Mock Training:     http://localhost:8001/docs
echo.
echo 🛑 To stop services, close the terminal windows or press Ctrl+C in each
echo 📝 Check the terminal windows for live logs

REM Create stop script
echo @echo off > stop-backend.bat
echo echo 🛑 Stopping Nainovate AI Backend Services... >> stop-backend.bat
echo taskkill /f /im python.exe /fi "WINDOWTITLE eq Job-Management-API*" 2^>nul >> stop-backend.bat
echo taskkill /f /im python.exe /fi "WINDOWTITLE eq Training-Monitor-API*" 2^>nul >> stop-backend.bat
echo echo ✅ Backend services stopped successfully! >> stop-backend.bat
echo pause >> stop-backend.bat

echo 📝 Created stop-backend.bat for easy service management
echo.
pause
