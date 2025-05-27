#!/bin/bash

# SwaggerHub CLI Installation Script
# Supports both development and global installation

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check command existence
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to get npm prefix
get_npm_prefix() {
    npm config get prefix 2>/dev/null || echo "/usr/local"
}

# Banner
clear
echo ""
print_color "$BLUE" "╔═══════════════════════════════════════╗"
print_color "$BLUE" "║     🚀 SwaggerHub CLI Installation    ║"
print_color "$BLUE" "╚═══════════════════════════════════════╝"
echo ""

# Check Node.js version
print_color "$YELLOW" "📋 Checking prerequisites..."

if ! command_exists node; then
    print_color "$RED" "❌ Node.js is not installed."
    echo "Please install Node.js (v14 or higher) from https://nodejs.org"
    exit 1
fi

if ! command_exists npm; then
    print_color "$RED" "❌ npm is not installed."
    echo "Please install npm or use a Node.js distribution that includes npm."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 14 ]; then
    print_color "$RED" "❌ Node.js version is too old. Found: $(node -v)"
    echo "Please upgrade to Node.js v14 or higher."
    exit 1
fi

print_color "$GREEN" "✓ Node.js $(node -v) detected"
print_color "$GREEN" "✓ npm $(npm -v) detected"
echo ""

# Detect if we're in development mode (has src directory)
if [ -d "src" ] && [ -f "package.json" ]; then
    print_color "$YELLOW" "📂 Development mode detected"
    INSTALL_MODE="development"
else
    print_color "$YELLOW" "📦 Installing from npm registry"
    INSTALL_MODE="global"
fi

echo ""

# Installation based on mode
if [ "$INSTALL_MODE" = "development" ]; then
    # Development installation
    print_color "$YELLOW" "📦 Installing dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✓ Dependencies installed successfully"
    else
        print_color "$RED" "❌ Failed to install dependencies"
        exit 1
    fi
    
    echo ""
    print_color "$YELLOW" "🔗 Creating global link..."
    
    # Check if running with sudo/proper permissions
    NPM_PREFIX=$(get_npm_prefix)
    if [ ! -w "$NPM_PREFIX" ] && [ "$EUID" -ne 0 ]; then
        print_color "$YELLOW" "⚠️  npm global directory requires elevated permissions"
        print_color "$YELLOW" "   You may need to run: sudo npm link"
        echo ""
        read -p "Would you like to try with sudo? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo npm link
        else
            print_color "$YELLOW" "⚠️  Skipping global link. You can run 'npm link' manually later."
        fi
    else
        npm link
    fi
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✓ Global link created successfully"
    fi
else
    # Global installation from npm
    print_color "$YELLOW" "📦 Installing SwaggerHub CLI globally..."
    
    # Check if running with sudo/proper permissions
    NPM_PREFIX=$(get_npm_prefix)
    if [ ! -w "$NPM_PREFIX" ] && [ "$EUID" -ne 0 ]; then
        print_color "$YELLOW" "⚠️  npm global directory requires elevated permissions"
        print_color "$YELLOW" "   Trying with sudo..."
        sudo npm install -g swaggerhub-cli
    else
        npm install -g swaggerhub-cli
    fi
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✓ SwaggerHub CLI installed globally"
    else
        print_color "$RED" "❌ Failed to install SwaggerHub CLI"
        exit 1
    fi
fi

# Verify installation
echo ""
print_color "$YELLOW" "🔍 Verifying installation..."

if command_exists swaggerhub; then
    INSTALLED_VERSION=$(swaggerhub --version 2>/dev/null || echo "unknown")
    print_color "$GREEN" "✓ SwaggerHub CLI is available (version: $INSTALLED_VERSION)"
    INSTALL_PATH=$(which swaggerhub)
    print_color "$BLUE" "   Installed at: $INSTALL_PATH"
else
    print_color "$RED" "❌ SwaggerHub CLI is not in PATH"
    echo "   You may need to add npm's global bin directory to your PATH"
    echo "   Add this to your shell profile:"
    echo "   export PATH=\"\$PATH:$(npm config get prefix)/bin\""
fi

# Create example configuration if in development
if [ "$INSTALL_MODE" = "development" ] && [ ! -f ".swaggerhub.json" ]; then
    echo ""
    print_color "$YELLOW" "📝 Creating example configuration..."
    cat > .swaggerhub.example.json << EOF
{
  "projectName": "My API Project",
  "port": 3000,
  "theme": "default",
  "apis": []
}
EOF
    print_color "$GREEN" "✓ Created .swaggerhub.example.json"
fi

# Success message
echo ""
print_color "$GREEN" "✅ Installation complete!"
echo ""
print_color "$BLUE" "╔═══════════════════════════════════════╗"
print_color "$BLUE" "║        📖 Quick Start Guide           ║"
print_color "$BLUE" "╚═══════════════════════════════════════╝"
echo ""
echo "1. Initialize SwaggerHub in your project:"
print_color "$YELLOW" "   $ swaggerhub init"
echo ""
echo "2. Add your swagger files:"
print_color "$YELLOW" "   $ swaggerhub add"
echo "   or"
print_color "$YELLOW" "   $ swaggerhub add ./path/to/swagger.yaml"
echo ""
echo "3. Start the web portal:"
print_color "$YELLOW" "   $ swaggerhub home"
echo ""
echo "4. Or serve a specific API:"
print_color "$YELLOW" "   $ swaggerhub serve"
echo ""
echo "Other useful commands:"
print_color "$YELLOW" "   $ swaggerhub list      # List all APIs"
print_color "$YELLOW" "   $ swaggerhub validate  # Validate swagger files"
print_color "$YELLOW" "   $ swaggerhub --help    # Show all commands"
echo ""

# Optional: Show directory structure for development mode
if [ "$INSTALL_MODE" = "development" ]; then
    print_color "$BLUE" "📁 Project Structure:"
    echo "   swaggerhub/"
    echo "   ├── bin/           # CLI entry point"
    echo "   ├── src/"
    echo "   │   ├── commands/  # Command implementations"
    echo "   │   ├── services/  # Business logic"
    echo "   │   ├── utils/     # Utilities"
    echo "   │   └── templates/ # HTML templates"
    echo "   └── package.json"
    echo ""
fi

# Ask if user wants to initialize in current directory
if [ "$INSTALL_MODE" = "global" ] || [ ! -f ".swaggerhub.json" ]; then
    echo ""
    read -p "Would you like to initialize SwaggerHub in the current directory? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command_exists swaggerhub; then
            swaggerhub init
        else
            print_color "$RED" "❌ Cannot run swaggerhub init - command not found in PATH"
        fi
    fi
fi

# Ask if user wants to see help
echo ""
read -p "Would you like to see the help menu? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command_exists swaggerhub; then
        swaggerhub --help
    else
        print_color "$RED" "❌ Cannot show help - swaggerhub command not found in PATH"
    fi
fi

echo ""
print_color "$GREEN" "🎉 Happy documenting with SwaggerHub!"
echo ""

# Exit successfully
exit 0