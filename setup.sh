#!/bin/bash

echo "🚨 Setting up Neighbourhood Crime Reporting System..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH."
    echo "Please install MongoDB or use MongoDB Atlas cloud service."
    echo "Visit: https://docs.mongodb.com/manual/installation/"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check the error messages above."
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Create environment file
if [ ! -f "server/.env" ]; then
    echo "🔧 Creating environment configuration..."
    cp server/config.env server/.env
    echo "✅ Environment file created at server/.env"
    echo "⚠️  Please edit server/.env with your API keys and configuration"
else
    echo "✅ Environment file already exists"
fi

# Create uploads directory
mkdir -p server/uploads
echo "✅ Uploads directory created"

# Setup initial users
echo "👥 Setting up initial demo users..."
cd server
node scripts/setup-admin.js
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your API keys"
echo "2. Start MongoDB (if running locally)"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "Demo accounts:"
echo "- Admin: admin@demo.com / password123"
echo "- Police: police@demo.com / password123"
echo "- Citizen: citizen@demo.com / password123"
echo ""
echo "Access the application at: http://localhost:3000"
echo "API endpoint: http://localhost:5000"
