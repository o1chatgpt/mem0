#!/bin/bash

# Build the Next.js application
npm run build

# Check if the user wants to run with sudo (for port 80)
if [ "$1" == "--sudo" ]; then
  echo "Starting server with sudo on port 80..."
  sudo NODE_ENV=production node server.js
else
  # Default to port 3000 if not running with sudo
  echo "Starting server on port 3000..."
  PORT=3000 NODE_ENV=production node server.js
fi
