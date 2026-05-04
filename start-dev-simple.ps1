# Simple dev startup script

Write-Host "Starting development environment..." -ForegroundColor Cyan

# Step 1: Start Docker
Write-Host "Starting PostgreSQL with Docker..." -ForegroundColor Yellow
docker compose up -d
Start-Sleep -Seconds 5

# Step 2: Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
Set-Location server
npx prisma migrate deploy 2>&1
if ($LASTEXITCODE -ne 0) {
    npx prisma migrate dev --name init 2>&1
}
npx prisma generate 2>&1
Set-Location ..

# Step 3: Start servers in parallel
Write-Host "Starting API server and client..." -ForegroundColor Yellow
Write-Host "" -ForegroundColor Cyan
Write-Host "Server: http://localhost:5000/api/health" -ForegroundColor Green
Write-Host "Client: http://localhost:5173" -ForegroundColor Green
Write-Host "Setup Key: ieee-dev-setup-key-2026" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Cyan

$serverJob = Start-Job -ScriptBlock { Set-Location "d:\Projects\Automation-Version-1\server"; npm run dev 2>&1 }
$clientJob = Start-Job -ScriptBlock { Set-Location "d:\Projects\Automation-Version-1\client"; npm run dev 2>&1 }

# Keep the jobs running
while ($true) {
    $serverJob | Receive-Job
    $clientJob | Receive-Job
    Start-Sleep -Milliseconds 100
}
