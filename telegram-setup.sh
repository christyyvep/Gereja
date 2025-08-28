#!/bin/bash

# MyRajawali Telegram Integration - Quick Start Guide
# Script untuk testing dan menjalankan implementasi Telegram

echo "🤖 MyRajawali Telegram Integration Setup"
echo "========================================"
echo ""

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1 - Found"
    else
        echo "❌ $1 - Missing"
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/ - Found"
    else
        echo "❌ $1/ - Missing"
        return 1
    fi
}

echo "📋 Checking Implementation Files..."
echo "=================================="

# Check core files
check_file "src/services/telegramService.js"
check_file "src/views/admin/AdminTelegram.vue"
check_file ".env.example"
check_file "test-telegram.html"
check_file "TELEGRAM_INTEGRATION_IMPLEMENTATION.md"

echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Check if Telegram variables are set
    if grep -q "VUE_APP_TELEGRAM_BOT_TOKEN" .env; then
        echo "✅ Telegram bot token configured"
    else
        echo "⚠️  Telegram bot token not configured in .env"
    fi
    
    if grep -q "VUE_APP_TELEGRAM_CHAT_ID" .env; then
        echo "✅ Telegram chat ID configured"
    else
        echo "⚠️  Telegram chat ID not configured in .env"
    fi
else
    echo "⚠️  .env file not found - copy from .env.example"
    echo "   cp .env.example .env"
fi

echo ""
echo "🚀 Quick Start Commands:"
echo "======================="
echo ""

echo "1. Copy environment file (if not done yet):"
echo "   cp .env.example .env"
echo ""

echo "2. Edit .env and add your Telegram configuration:"
echo "   VUE_APP_TELEGRAM_BOT_TOKEN=your_bot_token_here"
echo "   VUE_APP_TELEGRAM_CHAT_ID=your_chat_id_here"
echo ""

echo "3. Test Telegram Bot setup:"
echo "   Open test-telegram.html in browser"
echo "   Or: python -m http.server 8000 && open http://localhost:8000/test-telegram.html"
echo ""

echo "4. Run development server:"
echo "   npm run serve"
echo ""

echo "5. Access admin panel:"
echo "   http://localhost:8084/admin/telegram"
echo ""

echo "📱 Telegram Bot Setup Guide:"
echo "============================"
echo ""
echo "1. Create Bot:"
echo "   - Chat with @BotFather on Telegram"
echo "   - Send /newbot command"
echo "   - Follow instructions to create bot"
echo "   - Save the bot token"
echo ""

echo "2. Setup Group:"
echo "   - Create Telegram group for church members"
echo "   - Add your bot to the group"
echo "   - Make bot admin in the group"
echo "   - Send any message in group"
echo ""

echo "3. Get Chat ID:"
echo "   - Visit: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
echo "   - Look for \"chat\":{\"id\":-1001234567890}"
echo "   - Copy the chat ID (negative number for groups)"
echo ""

echo "🧪 Testing Checklist:"
echo "==================="
echo ""
echo "□ Bot token works (test connection)"
echo "□ Chat ID is correct (can send test message)"
echo "□ Bot is admin in the group"
echo "□ Group members can see bot messages"
echo "□ Admin can access /admin/telegram page"
echo "□ Renungan auto-send works when uploading new devotional"
echo ""

echo "📚 Documentation:"
echo "================="
echo "• TELEGRAM_INTEGRATION_IMPLEMENTATION.md - Complete implementation guide"
echo "• test-telegram.html - Browser-based testing tool"
echo "• .env.example - Environment variables template"
echo ""

echo "🆘 Troubleshooting:"
echo "=================="
echo ""
echo "❌ Bot can't send messages:"
echo "   - Check bot is admin in group"
echo "   - Verify chat ID is correct (negative for groups)"
echo "   - Test bot token with /getMe API"
echo ""

echo "❌ Connection test fails:"
echo "   - Check internet connection"
echo "   - Verify bot token format"
echo "   - Try manual API call in browser"
echo ""

echo "❌ Messages not formatted:"
echo "   - Ensure parse_mode is set to 'HTML'"
echo "   - Check HTML tags are properly closed"
echo "   - Test with simple message first"
echo ""

echo "✅ Ready to test! Start with opening test-telegram.html"
