#!/bin/sh

# Start the backend node server in the background
echo "Starting backend Node server..."
cd /app/backend && node dist/index.js &

# Start Nginx in the foreground
echo "Starting Nginx reverse proxy..."
nginx -g "daemon off;"
