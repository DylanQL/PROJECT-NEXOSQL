#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")"

echo "Installing backend dependencies..."
cd backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "All dependencies installed successfully!"
