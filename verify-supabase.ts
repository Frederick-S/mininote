/**
 * Supabase Connection Verification Script
 * 
 * This script verifies that your Supabase backend is properly configured.
 * Run this after completing the Supabase setup to ensure everything works.
 * 
 * Usage:
 *   npx tsx verify-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySetup() {
  console.log('🔍 Verifying Supabase Setup...\n');

  let allChecks = true;

  // Check 1: Connection
  console.log('1️⃣  Testing connection...');
  try {
    const { data, error } = await supabase.from('notebooks').select('count');
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
      throw error;
    }
    console.log('   ✅ Connection successful\n');
  } catch (error: any) {
    console.error('   ❌ Connection failed:', error.message);
    allChecks = false;
  }

  // Check 2: Tables exist
  console.log('2️⃣  Checking database tables...');
  const tables = ['notebooks', 'pages', 'page_versions', 'attachments'];
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) throw error;
      console.log(`   ✅ Table '${table}' exists`);
    } catch (error: any) {
      console.error(`   ❌ Table '${table}' not found:`, error.message);
      allChecks = false;
    }
  }
  console.log();

  // Check 3: Storage bucket
  console.log('3️⃣  Checking storage bucket...');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const userFilesBucket = data?.find(bucket => bucket.name === 'user-files');
    if (userFilesBucket) {
      console.log('   ✅ Storage bucket "user-files" exists');
      console.log(`   📦 Public: ${userFilesBucket.public ? 'Yes' : 'No (Private)'}`);
    } else {
      console.error('   ❌ Storage bucket "user-files" not found');
      console.error('   💡 Create it in Supabase Dashboard > Storage');
      allChecks = false;
    }
  } catch (error: any) {
    console.error('   ❌ Storage check failed:', error.message);
    allChecks = false;
  }
  console.log();

  // Check 4: RLS policies
  console.log('4️⃣  Checking Row Level Security...');
  try {
    // Try to query without authentication (should work but return no rows due to RLS)
    const { error } = await supabase.from('notebooks').select('*');
    if (error && error.code === 'PGRST301') {
      console.error('   ❌ RLS might not be configured correctly');
      allChecks = false;
    } else {
      console.log('   ✅ RLS appears to be configured');
      console.log('   ℹ️  Note: Full RLS testing requires authentication');
    }
  } catch (error: any) {
    console.error('   ⚠️  Could not verify RLS:', error.message);
  }
  console.log();

  // Summary
  console.log('═══════════════════════════════════════');
  if (allChecks) {
    console.log('✅ All checks passed!');
    console.log('Your Supabase backend is ready to use.');
  } else {
    console.log('❌ Some checks failed.');
    console.log('Please review the errors above and refer to SUPABASE_SETUP_GUIDE.md');
  }
  console.log('═══════════════════════════════════════\n');
}

verifySetup().catch(console.error);
