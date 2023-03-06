#!/bin/bash

echo "🚢 Deploying database"

# Run Sqitch deployment
cd db && sqitch rebase db:$DATABASE_URL && sqitch verify db:$DATABASE_URL

echo "🏝 Database deployed to $DATABASE_URL"

# Start application
cd .. && node server.js