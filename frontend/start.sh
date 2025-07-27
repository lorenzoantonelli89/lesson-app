#!/bin/bash

# Run database migrations
echo "Running database migrations..."
npx prisma db push

# Start the application
echo "Starting the application..."
npm run dev 