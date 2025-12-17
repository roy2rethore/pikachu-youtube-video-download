# Frontend Server Startup Script
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

cd frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host "`nFrontend server starting on http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm run dev

