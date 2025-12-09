#!/bin/bash

# Turquoise Holidays - VPS Deployment Script
# This script is executed on the VPS server during deployment

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if .env file exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local file not found. Make sure environment variables are set.${NC}"
fi

# Pull latest code from Git
echo "📥 Pulling latest code from Git..."
git fetch origin
git reset --hard origin/main
git clean -fd

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build Next.js application
echo "🔨 Building Next.js application..."
npm run build

# Create logs directory if it doesn't exist
mkdir -p logs

# Restart PM2 process
echo "🔄 Restarting application with PM2..."
if pm2 list | grep -q "turquoise"; then
    pm2 restart turquoise
else
    pm2 start ecosystem.config.js
    pm2 save
fi

# Show PM2 status
echo "📊 Application status:"
pm2 status turquoise

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "🌐 Your application should be running on port 3000"
