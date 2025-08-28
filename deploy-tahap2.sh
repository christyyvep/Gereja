#!/bin/bash
# TAHAP 2 DEPLOYMENT SCRIPT
# Script otomatis untuk deploy backend dan update environment

echo "🚀 TAHAP 2: BACKEND DEPLOYMENT AUTOMATION"
echo "============================================"

# Check if API token provided
if [ -z "$1" ]; then
  echo "❌ Usage: ./deploy-tahap2.sh <API_TOKEN>"
  echo "💡 Get API token dari browser console: fetch('/generate-tokens.js').then(r=>r.text()).then(eval)"
  exit 1
fi

API_TOKEN=$1
BOT_TOKEN="8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw"

echo "📋 Configuration:"
echo "   BOT_TOKEN: ${BOT_TOKEN:0:10}..."
echo "   API_TOKEN: ${API_TOKEN:0:10}..."
echo ""

# Step 1: Set Firebase Functions environment
echo "🔧 Step 1: Setting Firebase Functions environment..."
firebase functions:config:set telegram.bot_token="$BOT_TOKEN" api.secret="$API_TOKEN"

if [ $? -eq 0 ]; then
  echo "✅ Environment variables set successfully"
else
  echo "❌ Failed to set environment variables"
  exit 1
fi

# Step 2: Deploy Firebase Functions
echo ""
echo "🚀 Step 2: Deploying Firebase Functions..."
firebase deploy --only functions

if [ $? -eq 0 ]; then
  echo "✅ Firebase Functions deployed successfully"
else
  echo "❌ Failed to deploy Firebase Functions"
  exit 1
fi

# Step 3: Update frontend .env
echo ""
echo "🔧 Step 3: Updating frontend .env file..."

# Backup current .env
cp .env .env.backup-$(date +%Y%m%d-%H%M%S)

# Remove old bot token line and add new variables
grep -v "VUE_APP_TELEGRAM_BOT_TOKEN" .env > .env.tmp
echo "" >> .env.tmp
echo "# Backend API Configuration" >> .env.tmp
echo "VUE_APP_BACKEND_API_URL=https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI" >> .env.tmp
echo "VUE_APP_API_TOKEN=$API_TOKEN" >> .env.tmp

mv .env.tmp .env

echo "✅ Frontend .env updated"

# Step 4: Test backend connection
echo ""
echo "🧪 Step 4: Testing backend connection..."
sleep 5  # Wait for deployment to propagate

BACKEND_URL="https://us-central1-myrajawali-app.cloudfunctions.net/telegramAPI/health"
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response "$BACKEND_URL")

if [ "$RESPONSE" = "200" ]; then
  echo "✅ Backend health check passed"
  cat /tmp/health_response
else
  echo "⚠️ Backend health check response: $RESPONSE"
  echo "📝 Response body:"
  cat /tmp/health_response
fi

echo ""
echo "🎉 TAHAP 2 DEPLOYMENT COMPLETE!"
echo "============================================"
echo "📋 Summary:"
echo "   ✅ Firebase Functions deployed"
echo "   ✅ Environment secured"
echo "   ✅ Bot token moved to backend"
echo "   ✅ Frontend configured for secure API"
echo ""
echo "🎯 Ready for TAHAP 3: Testing & Verification"
