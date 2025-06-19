Write-Host "🔄 Managing FuelSync Database..." -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

try {
    # Change to backend directory
    Set-Location -Path "C:\Users\r.kowdampalli\Documents\Continue\fuelsync-hub\backend"
    
    # Run database initialization
    Write-Host "📊 Initializing database..." -ForegroundColor Yellow
    npx ts-node db/setup-db.ts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    } else {
        throw "Database initialization failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
