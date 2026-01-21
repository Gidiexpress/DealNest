@echo off
rem Change to the directory where this script is located
cd /d "%~dp0"

echo Checking for virtual environment...
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
) else (
    echo No virtual environment found in .venv. Using global Python.
)

cd backend
echo Installing dependencies...
pip install -r requirements.txt --no-warn-script-location
if %errorlevel% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b %errorlevel%
)


rem Database reset removed to ensure persistence.

echo Making migrations (Forcing app detection)...
python manage.py makemigrations core deals payments
if %errorlevel% neq 0 (
    echo Error making migrations.
    pause
    exit /b %errorlevel%
)

echo Migrating database (SQLite)...
python manage.py migrate
if %errorlevel% neq 0 (
    echo Error migrating database.
    pause
    exit /b %errorlevel%
)

echo Seeding data...
python manage.py seed_data
if %errorlevel% neq 0 (
    echo Error seeding data.
    pause
    exit /b %errorlevel%
)

echo Starting Django Server...
python manage.py runserver 0.0.0.0:8000
pause
