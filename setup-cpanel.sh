#!/bin/bash
# cPanel Post-Install Script
# Run this after uploading files to cPanel

echo "=== AIUAG cPanel Setup ==="

# 1. Install dependencies
echo "Installing dependencies..."
npm install --production

# 2. Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# 3. Push database schema
echo "Pushing database schema..."
npx prisma db push --accept-data-loss

# 4. Build the application
echo "Building application..."
npm run build

# 5. Start the application
echo "Starting application..."
npm start

echo "=== Setup Complete ==="
echo "Your app should be running on port 3000"
