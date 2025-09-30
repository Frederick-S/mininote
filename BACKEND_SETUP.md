# Backend Setup Guide

This guide will help you configure and deploy the AWS Amplify backend services for the Web Note App.

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS Credentials**: Access Key ID and Secret Access Key with the following permissions:
   - Amazon Cognito (for authentication)
   - AWS AppSync (for GraphQL API)
   - Amazon DynamoDB (for database)
   - Amazon S3 (for file storage)
   - AWS CloudFormation (for infrastructure deployment)

## Step 1: Configure AWS Credentials

Run the following command to configure your AWS credentials:

```bash
npx ampx configure profile
```

You'll be prompted to enter:
- **Access Key ID**: Your AWS Access Key ID
- **Secret Access Key**: Your AWS Secret Access Key  
- **Region**: Recommended `us-east-1`

## Step 2: Deploy Backend Services

Once credentials are configured, deploy the backend:

```bash
./scripts/deploy-backend.sh
```

Or manually:

```bash
npx ampx sandbox --once
```

## What Gets Deployed

The backend deployment will create the following AWS services:

### 🔐 Authentication (Amazon Cognito)
- User Pool for email/password authentication
- Email verification for new accounts
- Account recovery via email

### 📊 GraphQL API (AWS AppSync)
- Complete schema for notebooks, pages, versions, and attachments
- User-based authorization (users can only access their own data)
- Optimized indexes for efficient queries:
  - Notebooks by owner
  - Pages by notebook and parent page
  - Page versions by page
  - Attachments by page

### 🗄️ Database (Amazon DynamoDB)
- **Users**: User profile information
- **Notebooks**: Notebook metadata and organization
- **Pages**: Page content with hierarchical structure
- **PageVersions**: Version history for pages
- **Attachments**: File metadata and references

### 📁 File Storage (Amazon S3)
- Organized file structure: `attachments/{userId}/{pageId}/{type}/*`
- Support for images, documents, and videos
- User-scoped access (users can only access their own files)

## Verification

After successful deployment:

1. Check that `amplify_outputs.json` contains real AWS resource IDs (not placeholders)
2. The file should include:
   - Cognito User Pool ID and Client ID
   - AppSync GraphQL endpoint
   - S3 bucket name
   - AWS region information

## Troubleshooting

### Credential Issues
- Ensure your AWS credentials have the necessary permissions
- Try running `npx ampx configure profile --list` to verify configuration

### Deployment Failures
- Check AWS CloudFormation console for detailed error messages
- Ensure your AWS account has sufficient service limits
- Verify the region supports all required services

### Permission Errors
- Your AWS user/role needs permissions for:
  - CloudFormation (full access)
  - Cognito (full access)
  - AppSync (full access)
  - DynamoDB (full access)
  - S3 (full access)
  - IAM (limited access for role creation)

## Next Steps

Once the backend is deployed successfully:

1. Start the development server: `npm run dev`
2. The app will automatically connect to your deployed backend
3. You can begin implementing the frontend authentication and data management features

## Backend Configuration Details

The backend is configured with:

- **Authentication**: Email-based signup with verification
- **Authorization**: Owner-based access (users only see their own data)
- **Database Indexes**: Optimized for common query patterns
- **File Storage**: Organized by user and page for efficient access
- **API**: GraphQL with real-time subscriptions support