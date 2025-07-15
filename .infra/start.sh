#!/bin/sh
echo "Starting Repo Crafter application..."
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "APP_ID: ${APP_ID:0:5}..." # Show only first 5 chars for security
echo "Starting server..."
exec npm start
