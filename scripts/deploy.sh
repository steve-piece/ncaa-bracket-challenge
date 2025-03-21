#!/bin/bash

# NCAA Bracket Challenge Deployment Script
# This script helps deploy the application to production

# Print colored messages
function print_message() {
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  RED='\033[0;31m'
  NC='\033[0m' # No Color
  
  case $1 in
    "info")
      echo -e "${GREEN}[INFO]${NC} $2"
      ;;
    "warning")
      echo -e "${YELLOW}[WARNING]${NC} $2"
      ;;
    "error")
      echo -e "${RED}[ERROR]${NC} $2"
      ;;
    *)
      echo "$2"
      ;;
  esac
}

# Check if .env.production exists
if [ ! -f .env.production ]; then
  print_message "error" ".env.production file not found. Please create it first."
  exit 1
fi

# Check if API key is set properly
if grep -q "YOUR_PRODUCTION_API_KEY" .env.production; then
  print_message "error" "Sportradar API key not set in .env.production. Please update it with your actual API key."
  exit 1
fi

# Check for git changes
if [ -n "$(git status --porcelain)" ]; then
  print_message "warning" "You have uncommitted changes. It's recommended to commit all changes before deployment."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_message "info" "Deployment canceled."
    exit 1
  fi
fi

# Run tests if available
if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
  print_message "info" "Running tests..."
  npm test
  
  if [ $? -ne 0 ]; then
    print_message "error" "Tests failed. Please fix the issues before deploying."
    exit 1
  fi
fi

# Build the application
print_message "info" "Building the application..."
npm run build

if [ $? -ne 0 ]; then
  print_message "error" "Build failed. Please fix the issues before deploying."
  exit 1
fi

# Choose deployment target
echo "Choose deployment target:"
echo "1) Vercel"
echo "2) Netlify"
echo "3) AWS Amplify"
echo "4) Custom server (via SCP)"
read -p "Enter choice (1-4): " deploy_choice

case $deploy_choice in
  1)
    # Vercel deployment
    print_message "info" "Deploying to Vercel..."
    if command -v vercel &> /dev/null; then
      vercel --prod
    else
      print_message "error" "Vercel CLI not found. Please install it first: npm i -g vercel"
      exit 1
    fi
    ;;
  2)
    # Netlify deployment
    print_message "info" "Deploying to Netlify..."
    if command -v netlify &> /dev/null; then
      netlify deploy --prod
    else
      print_message "error" "Netlify CLI not found. Please install it first: npm i -g netlify-cli"
      exit 1
    fi
    ;;
  3)
    # AWS Amplify deployment
    print_message "info" "Deploying to AWS Amplify..."
    if command -v amplify &> /dev/null; then
      amplify publish
    else
      print_message "error" "AWS Amplify CLI not found. Please install it first: npm i -g @aws-amplify/cli"
      exit 1
    fi
    ;;
  4)
    # Custom server deployment via SCP
    read -p "Enter server address (e.g., user@hostname): " server
    read -p "Enter destination path: " dest_path
    
    print_message "info" "Deploying to custom server..."
    scp -r .next package.json next.config.js public .env.production $server:$dest_path
    
    if [ $? -ne 0 ]; then
      print_message "error" "SCP transfer failed."
      exit 1
    fi
    
    print_message "info" "Files transferred. Remember to install dependencies and restart the server."
    ;;
  *)
    print_message "error" "Invalid choice."
    exit 1
    ;;
esac

print_message "info" "Deployment completed successfully!" 