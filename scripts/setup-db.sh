#!/bin/bash

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Run the database setup script
echo "Setting up database..."
npx ts-node scripts/setup-db.ts

echo "Database setup completed"
