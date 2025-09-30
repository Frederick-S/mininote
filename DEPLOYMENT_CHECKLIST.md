# Backend Deployment Checklist

Use this checklist to ensure your AWS Amplify backend is properly configured and deployed.

## Pre-Deployment

- [ ] **AWS Account Setup**
  - [ ] AWS account created and accessible
  - [ ] Billing configured (Amplify has a generous free tier)
  - [ ] IAM user created with appropriate permissions

- [ ] **Local Environment**
  - [ ] Node.js installed (v18+)
  - [ ] Project dependencies installed (`npm install`)
  - [ ] AWS credentials obtained (Access Key ID + Secret Access Key)

## Deployment Steps

- [ ] **Step 1: Configure AWS Credentials**
  ```bash
  npm run backend:configure
  ```
  - [ ] Enter Access Key ID
  - [ ] Enter Secret Access Key
  - [ ] Select region (recommended: us-east-1)

- [ ] **Step 2: Deploy Backend Services**
  ```bash
  npm run backend:setup
  ```
  - [ ] Authentication service deployed (Cognito)
  - [ ] GraphQL API deployed (AppSync)
  - [ ] Database deployed (DynamoDB)
  - [ ] File storage deployed (S3)

- [ ] **Step 3: Validate Deployment**
  ```bash
  npm run backend:validate
  ```
  - [ ] All services show ✅ status
  - [ ] No placeholder values in configuration
  - [ ] Real AWS resource IDs present

## Post-Deployment Verification

- [ ] **Configuration Files**
  - [ ] `amplify_outputs.json` updated with real values
  - [ ] User Pool ID is not "placeholder"
  - [ ] GraphQL endpoint contains "appsync"
  - [ ] S3 bucket name is not "placeholder"

- [ ] **AWS Console Verification** (Optional)
  - [ ] Cognito User Pool visible in AWS Console
  - [ ] AppSync API visible in AWS Console
  - [ ] DynamoDB tables created
  - [ ] S3 bucket created

- [ ] **Connection Test**
  ```bash
  npm run backend:test
  ```
  - [ ] Amplify configuration loads successfully
  - [ ] GraphQL client creates without errors

## Troubleshooting

### Common Issues

**Credential Errors**
- Verify AWS credentials are correct
- Check IAM permissions include CloudFormation, Cognito, AppSync, DynamoDB, S3
- Try `npx ampx configure profile --list` to verify configuration

**Deployment Failures**
- Check AWS service limits in your region
- Verify region supports all required services
- Check CloudFormation stack in AWS Console for detailed errors

**Permission Denied**
- Ensure IAM user has sufficient permissions
- Check if MFA is required for your AWS account
- Verify account is not in a restricted state

### Getting Help

1. Check AWS CloudFormation console for detailed error messages
2. Review Amplify CLI logs for specific error details
3. Verify AWS service status at https://status.aws.amazon.com/
4. Check Amplify documentation at https://docs.amplify.aws/

## Success Criteria

✅ **Backend is ready when:**
- All validation checks pass
- `amplify_outputs.json` contains real AWS resource identifiers
- Connection test completes successfully
- Development server starts without configuration errors

## Next Steps After Successful Deployment

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Implement Authentication**
   - Create login/signup components
   - Test user registration flow
   - Verify email verification works

3. **Test Data Operations**
   - Create first notebook
   - Add pages to notebook
   - Test file upload functionality

4. **Monitor Usage**
   - Check AWS billing dashboard
   - Monitor service usage in AWS Console
   - Set up billing alerts if needed