# Backend Server Startup Script
Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

cd backend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "`nBackend server starting on http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm run dev

