#!/bin/bash

# SwaggerHub CLI Installation Script

echo "🚀 SwaggerHub CLI Installation"
echo "=============================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔗 Creating global link..."
npm link

echo ""
echo "✅ Installation complete!"
echo ""
echo "📖 Quick Start Guide:"
echo "-------------------"
echo "1. Initialize SwaggerHub in your project:"
echo "   $ swaggerhub init"
echo ""
echo "2. Add your swagger files:"
echo "   $ swaggerhub add"
echo "   or"
echo "   $ swaggerhub add ./path/to/swagger.yaml"
echo ""
echo "3. Start the web portal:"
echo "   $ swaggerhub home"
echo ""
echo "4. Or serve a specific API:"
echo "   $ swaggerhub serve"
echo ""
echo "For more help, run: swaggerhub --help"
echo ""

# Ask if user wants to see the help
read -p "Would you like to see the help menu now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    swaggerhub --help
fi