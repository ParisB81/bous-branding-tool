@echo off
echo ========================================
echo   BOUS Brand Guidelines - Setup
echo ========================================
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting the app...
echo App will open at http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.
npm run dev
