@echo off
rem Change to the directory where this script is located
cd /d "%~dp0"

cd frontend
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b %errorlevel%
)

echo Starting Next.js Dev Server...
call npm run dev
pause
