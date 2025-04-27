#!/bin/bash

# Install NGINX if not already installed
if ! command -v nginx &> /dev/null; then
    echo "Installing NGINX..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Copy the NGINX configuration
sudo cp nginx.conf /etc/nginx/sites-available/webcontainer-manager

# Create a symbolic link to enable the site
sudo ln -sf /etc/nginx/sites-available/webcontainer-manager /etc/nginx/sites-enabled/

# Test the NGINX configuration
sudo nginx -t

# Restart NGINX to apply changes
sudo systemctl restart nginx

# Start the Node.js server on port 3000
PORT=3000 NODE_ENV=production node server.js
