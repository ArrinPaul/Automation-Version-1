# IEEE Finance Pro — Dev Startup Script
# Run this from the project root: .\start-dev.ps1

Write-Host "🚀 IEEE Finance Pro — Starting Development Environment" -ForegroundColor Cyan

# Step 1: Start PostgreSQL via Docker Compose
Write-Host "`n[1/3] Starting PostgreSQL database..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker Compose failed. Make sure Docker Desktop is running!" -ForegroundColor Red
    exit 1
}

# Wait for DB to be healthy
Write-Host "     Waiting for database to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Step 2: Run Prisma migrations
Write-Host "`n[2/3] Running Prisma database migrations..." -ForegroundColor Yellow
Set-Location server
npx prisma migrate deploy 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "     Trying prisma migrate dev instead..." -ForegroundColor Gray
    npx prisma migrate dev --name init 2>&1
}
npx prisma generate 2>&1
Set-Location ..

# Step 3: Start both servers
Write-Host "`n[3/3] Starting API server (port 5000) and client (port 5173)..." -ForegroundColor Yellow
Write-Host "      Press Ctrl+C to stop all processes`n" -ForegroundColor Gray

$serverJob = Start-Job -ScriptBlock {
    Set-Location "d:\IEEESBAPP\server"
    npm run dev 2>&1
}

$clientJob = Start-Job -ScriptBlock {
    Set-Location "d:\IEEESBAPP\client"
    npm run dev 2>&1
}

Write-Host "✅ Server: http://localhost:5000/api/health" -ForegroundColor Green
Write-Host "✅ Client: http://localhost:5173" -ForegroundColor Green
Write-Host "   Setup Key: ieee-dev-setup-key-2026`n" -ForegroundColor Cyan

# Stream output from both jobs
while ($true) {
    Receive-Job $serverJob | ForEach-Object { Write-Host "[SERVER] $_" -ForegroundColor Blue }
    Receive-Job $clientJob | ForEach-Object { Write-Host "[CLIENT] $_" -ForegroundColor Magenta }
    Start-Sleep -Milliseconds 500
}
