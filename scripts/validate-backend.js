#!/usr/bin/env node

/**
 * Backend Validation Script
 * Checks if AWS Amplify backend is properly configured and deployed
 */

import fs from 'fs';
import path from 'path';

const OUTPUTS_FILE = 'amplify_outputs.json';

function validateBackend() {
    console.log('🔍 Validating AWS Amplify Backend Configuration...\n');

    // Check if outputs file exists
    if (!fs.existsSync(OUTPUTS_FILE)) {
        console.error('❌ amplify_outputs.json not found');
        console.log('Run: npm run backend:setup');
        process.exit(1);
    }

    // Read and parse outputs
    let outputs;
    try {
        const outputsContent = fs.readFileSync(OUTPUTS_FILE, 'utf8');
        outputs = JSON.parse(outputsContent);
    } catch (error) {
        console.error('❌ Failed to parse amplify_outputs.json:', error.message);
        process.exit(1);
    }

    let allValid = true;

    // Validate Authentication
    console.log('🔐 Authentication (Cognito):');
    if (outputs.auth && 
        outputs.auth.user_pool_id !== 'placeholder' && 
        outputs.auth.user_pool_client_id !== 'placeholder') {
        console.log('  ✅ User Pool configured');
        console.log(`  📋 Pool ID: ${outputs.auth.user_pool_id}`);
        console.log(`  📋 Client ID: ${outputs.auth.user_pool_client_id}`);
    } else {
        console.log('  ❌ Authentication not configured');
        allValid = false;
    }

    // Validate GraphQL API
    console.log('\n📊 GraphQL API (AppSync):');
    if (outputs.data && 
        outputs.data.url !== 'placeholder' && 
        outputs.data.url.includes('appsync')) {
        console.log('  ✅ GraphQL API configured');
        console.log(`  📋 Endpoint: ${outputs.data.url}`);
        console.log(`  📋 Auth Type: ${outputs.data.default_authorization_type}`);
    } else {
        console.log('  ❌ GraphQL API not configured');
        allValid = false;
    }

    // Validate Storage
    console.log('\n📁 File Storage (S3):');
    if (outputs.storage && 
        outputs.storage.bucket_name !== 'placeholder') {
        console.log('  ✅ S3 Storage configured');
        console.log(`  📋 Bucket: ${outputs.storage.bucket_name}`);
    } else {
        console.log('  ❌ S3 Storage not configured');
        allValid = false;
    }

    // Validate Region
    console.log('\n🌍 AWS Region:');
    const region = outputs.auth?.aws_region || outputs.data?.aws_region || outputs.storage?.aws_region;
    if (region && region !== 'placeholder') {
        console.log(`  ✅ Region: ${region}`);
    } else {
        console.log('  ❌ AWS Region not configured');
        allValid = false;
    }

    // Final result
    console.log('\n' + '='.repeat(50));
    if (allValid) {
        console.log('🎉 Backend is properly configured and ready!');
        console.log('\nNext steps:');
        console.log('  1. Run: npm run dev');
        console.log('  2. Start implementing authentication components');
        console.log('  3. Test user registration and login');
    } else {
        console.log('❌ Backend configuration incomplete');
        console.log('\nTo fix:');
        console.log('  1. Configure AWS credentials: npm run backend:configure');
        console.log('  2. Deploy backend: npm run backend:setup');
        console.log('  3. Run validation again: node scripts/validate-backend.js');
        process.exit(1);
    }
}

validateBackend();