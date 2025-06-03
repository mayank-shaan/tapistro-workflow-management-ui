#!/bin/bash

# Navigate to the project directory
cd /Users/msd/Work/Repositories/Personal/tapistro-workflow-management-ui

# Install the new dependency
echo "Installing dagre dependency..."
npm install dagre@^0.8.5

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dagre dependency installed successfully"
    
    # Start the development server
    echo "🚀 Starting development server..."
    echo "You can now test all the enhanced features:"
    echo "  1. Hover over edges to add nodes between them"
    echo "  2. Add/remove branches in decision nodes"
    echo "  3. Create and collapse group nodes"
    echo "  4. Use the enhanced toolbar features"
    echo ""
    echo "Opening http://localhost:3000..."
    
    npm start
else
    echo "❌ Failed to install dependencies"
    exit 1
fi