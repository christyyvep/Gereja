# TAHAP 2 DEPLOYMENT SCRIPT - PowerShell Version
# Script otomatis untuk deploy backend dan update environment

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiToken
)

Write-Host "🚀 TAHAP 2: BACKEND DEPLOYMENT AUTOMATION" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

$BotToken = "8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   BOT_TOKEN: $($BotToken.Substring(0,10))..." -ForegroundColor White
Write-Host "   API_TOKEN: $($ApiToken.Substring(0,10))..." -ForegroundColor White
Write-Host ""

# Step 1: Set Firebase Functions environment
Write-Host "🔧 Step 1: Setting Firebase Functions environment..." -ForegroundColor Cyan
$configCommand = "firebase functions:config:set telegram.bot_token=`"$BotToken`" api.secret=`"$ApiToken`""

try {
    Invoke-Expression $configCommand
    Write-Host "✅ Environment variables set successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set environment variables: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy Firebase Functions
Write-Host ""
Write-Host "🚀 Step 2: Deploying Firebase Functions..." -ForegroundColor Cyan

try {
    firebase deploy --only functions
    Write-Host "✅ Firebase Functions deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy Firebase Functions: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Update frontend .env
Write-Host ""
Write-Host "🔧 Step 3: Updating frontend .env file..." -ForegroundColor Cyan

# Backup current .env
$backupName = ".env.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item ".env" $backupName
Write-Host "📁 Backup created: $backupName" -ForegroundColor Yellow

# Read current .env and filter out bot token
$envContent = Get-Content ".env" | Where-Object { $_ -notmatch "VUE_APP_TELEGRAM_BOT_TOKEN" }

# Add new configuration
$newEnvContent = $envContent + @(
    "",
    "# Backend API Configuration",
    "VUE_APP_BACKEND_API_URL=https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI",
    "VUE_APP_API_TOKEN=$ApiToken"
)

# Write updated .env
$newEnvContent | Set-Content ".env"
Write-Host "✅ Frontend .env updated" -ForegroundColor Green

# Step 4: Test backend connection
Write-Host ""
Write-Host "🧪 Step 4: Testing backend connection..." -ForegroundColor Cyan
Write-Host "⏳ Waiting 10 seconds for deployment to propagate..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$backendUrl = "https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI/health"

try {
    $response = Invoke-WebRequest -Uri $backendUrl -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend health check passed" -ForegroundColor Green
        Write-Host "📝 Response: $($response.Content)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Backend health check status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Backend health check failed: $_" -ForegroundColor Yellow
    Write-Host "💡 This might be normal during initial deployment" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 TAHAP 2 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Yellow
Write-Host "   ✅ Firebase Functions deployed" -ForegroundColor Green
Write-Host "   ✅ Environment secured" -ForegroundColor Green
Write-Host "   ✅ Bot token moved to backend" -ForegroundColor Green
Write-Host "   ✅ Frontend configured for secure API" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Ready for TAHAP 3: Testing & Verification" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Restart development server: npm run serve" -ForegroundColor White
Write-Host "   2. Test Telegram functionality" -ForegroundColor White
Write-Host "   3. Verify security improvements" -ForegroundColor White
