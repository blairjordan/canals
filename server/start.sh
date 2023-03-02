#!/bin/bash

echo "🚢 Deploying database"

# Run Sqitch deployment
cd db && sqitch deploy db:$DATABASE_URL

echo "🏝 Database deployed to $DATABASE_URL"

# Start application
cd .. && node server.js