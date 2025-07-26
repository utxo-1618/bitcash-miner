#!/bin/bash

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    echo "Create .env with:"
    echo "PRIVATE_KEY=your_private_key"
    echo "BASE_RPC=https://mainnet.base.org"
    echo "ETH_RPC=your_eth_rpc"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY not set in .env"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Install dependencies
echo "Installing dependencies..."
npm install ethers

# Start PM2 ecosystem
echo "Starting PM2 ecosystem..."
pm2 start ecosystem.config.js

# Display status
echo "PM2 Status:"
pm2 list

# Display logs
echo "Following logs..."
pm2 logs
