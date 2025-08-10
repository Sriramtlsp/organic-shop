#!/bin/bash

# Deployment Script for Organic Shop E-commerce
# This script helps automate the deployment process

echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
fi

# Function to deploy to Heroku
deploy_heroku() {
    echo "🔧 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not found. Please install it first:"
        echo "https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Login to Heroku
    echo "🔐 Please login to Heroku..."
    heroku login
    
    # Create Heroku app
    read -p "Enter your app name (or press Enter for auto-generated): " app_name
    if [ -z "$app_name" ]; then
        heroku create
    else
        heroku create $app_name
    fi
    
    # Set environment variables
    echo "🔑 Setting environment variables..."
    echo "Please provide the following information:"
    
    read -p "MongoDB URI: " mongodb_uri
    read -p "JWT Secret: " jwt_secret
    read -p "Session Secret: " session_secret
    
    heroku config:set MONGODB_URI="$mongodb_uri"
    heroku config:set JWT_SECRET="$jwt_secret"
    heroku config:set SESSION_SECRET="$session_secret"
    heroku config:set NODE_ENV="production"
    
    # Deploy
    git push heroku main
    
    # Open app
    heroku open
    
    echo "✅ Deployment to Heroku completed!"
}

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "📦 Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Login and deploy
    railway login
    railway init
    railway up
    
    echo "✅ Deployment to Railway completed!"
    echo "🔑 Don't forget to set your environment variables in Railway dashboard"
}

# Main menu
echo "Choose your deployment platform:"
echo "1) Heroku (Recommended for beginners)"
echo "2) Railway (Modern platform)"
echo "3) Manual deployment guide"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        deploy_heroku
        ;;
    2)
        deploy_railway
        ;;
    3)
        echo "📖 Please refer to DEPLOYMENT_GUIDE.md for manual deployment instructions"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        ;;
esac

echo "🎉 Deployment process completed!"
