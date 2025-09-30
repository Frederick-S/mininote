#!/bin/bash

# Web Note App - Backend Deployment Script
# This script deploys the AWS Amplify backend services

echo "🚀 Deploying Web Note App Backend Services..."
echo ""

# Check if AWS credentials are configured
if ! npx ampx configure profile --list > /dev/null 2>&1; then
    echo "❌ AWS credentials not configured."
    echo "Please run: npx ampx configure profile"
    echo "You'll need:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - AWS Region (recommended: us-east-1)"
    exit 1
fi

echo "✅ AWS credentials found"

# Deploy the backend
echo "📦 Deploying Amplify backend..."
npx ampx sandbox --once

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Backend deployment successful!"
    echo ""
    echo "Services deployed:"
    echo "  ✅ Authentication (Amazon Cognito)"
    echo "  ✅ GraphQL API (AWS AppSync)"
    echo "  ✅ File Storage (Amazon S3)"
    echo "  ✅ Database (Amazon DynamoDB)"
    echo ""
    echo "The amplify_outputs.json file has been updated with your backend configuration."
    echo "You can now run 'npm run dev' to start the development server."
else
    echo ""
    echo "❌ Backend deployment failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi