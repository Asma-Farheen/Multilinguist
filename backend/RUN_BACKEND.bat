@echo off
setlocal

echo 🌿 ==========================================
echo    GRAMA AI - LOCAL BACKEND STARTUP
echo ==========================================
echo.

:: 1. Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [❌] Error: Python is not installed. 
    echo Please install Python from https://www.python.org/
    pause
    exit /b
)

:: 2. Create Virtual Environment if not exists
if not exist "venv" (
    echo [📦] Creating virtual environment...
    python -m venv venv
)

:: 3. Activate venv and Install dependencies
echo [⚙️] Installing dependencies (this may take a minute)...
call venv\Scripts\activate
pip install -r requirements.txt
pip install gTTS

echo.
echo [🚀] Starting Backend Server...
echo [📡] Backend will be live at http://localhost:8000
echo.

python main.py

pause
