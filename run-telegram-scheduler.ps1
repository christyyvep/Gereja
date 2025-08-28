# run-telegram-scheduler.ps1
# PowerShell script untuk menjalankan Telegram Scheduler (Windows)

Write-Host "🚀 Starting Telegram Scheduler..." -ForegroundColor Green

# Set working directory ke root project
Set-Location $PSScriptRoot\..

# Load environment variables dari .env jika ada
if (Test-Path ".env") {
    Write-Host "📁 Loading environment variables from .env" -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if the scheduler script exists
$schedulerScript = "scripts\run-telegram-scheduler.js"
if (-not (Test-Path $schedulerScript)) {
    Write-Host "❌ Scheduler script not found: $schedulerScript" -ForegroundColor Red
    exit 1
}

# Run the scheduler
Write-Host "📅 Running Telegram Scheduler..." -ForegroundColor Blue
try {
    node $schedulerScript
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "✅ Telegram Scheduler completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Telegram Scheduler failed with exit code: $exitCode" -ForegroundColor Red
    }
    
    exit $exitCode
} catch {
    Write-Host "❌ Error running Telegram Scheduler: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
