/**
 * Script to apply permission fixes to the Supabase database
 * 
 * Usage:
 * 1. Set your Supabase URL and service role API key in .env
 * 2. Run this script with: node apply_permission_fixes.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'sql', 'permissions_fix.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Applying SQL fixes to the database...');
    
    // Execute the SQL using the supabase client
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('Error applying SQL fixes:', error);
      process.exit(1);
    }
    
    console.log('✅ SQL fixes successfully applied!');
    
    // Verify that the user_id column exists on the mentors table
    const { data, error: verifyError } = await supabase
      .from('mentors')
      .select('user_id')
      .limit(1);
    
    if (verifyError) {
      console.warn('Warning: Could not verify user_id column:', verifyError);
    } else {
      console.log('✅ Verified user_id column exists on mentors table');
    }
    
    console.log('\nPermission fixes completed. Your application should now work correctly.');
    console.log('Remember to set user_id for any existing mentors to link them with their owners.');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

main();
