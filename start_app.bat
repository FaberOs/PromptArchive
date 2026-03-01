@echo off
echo Starting Prompt Archive...

:: Start Backend
echo Starting Backend Server (Port 8000)...
start "Prompt Archive Backend" cmd /k "call venv\Scripts\activate && uvicorn backend.main:app --reload --port 8000"

:: Start Frontend
echo Starting Frontend Server (Port 3000)...
start "Prompt Archive Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application is launching!
echo Access the app at: http://localhost:3000
echo.
pause
