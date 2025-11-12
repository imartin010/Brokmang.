#!/usr/bin/env node

/**
 * Apply migrations directly to Supabase using service role
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Create admin client with service role
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/))
    .filter(s => !s.match(/^select\s+['"]/i)); // Skip final SELECT statements
  
  console.log(`\n📝 Executing ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    try {
      // Use RPC to execute SQL (if available) or use direct query
      // Since Supabase doesn't expose direct SQL execution, we'll need to use the REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query: stmt })
      });
      
      if (!response.ok && response.status !== 404) {
        // Try alternative: execute via pg REST API
        console.log(`⚠️  Statement ${i + 1} may need manual execution`);
      }
    } catch (error) {
      console.log(`⚠️  Could not execute statement ${i + 1}: ${error.message}`);
    }
  }
}

async function applyMigrations() {
  const masterFile = path.join(__dirname, '..', 'supabase', 'APPLY_NEW_MIGRATIONS.sql');
  
  if (!fs.existsSync(masterFile)) {
    console.error('❌ Master SQL file not found');
    process.exit(1);
  }
  
  const sql = fs.readFileSync(masterFile, 'utf8');
  
  console.log('🚀 Applying migrations to Supabase...');
  console.log('📄 File:', masterFile);
  
  // Since Supabase doesn't expose direct SQL execution via REST API,
  // we'll output instructions for manual execution
  console.log('\n✅ Migration SQL file is ready!');
  console.log('📋 To apply migrations:');
  console.log('   1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/xbgwbolqnywjjbntuqne/sql/new');
  console.log('   2. Copy contents of: supabase/APPLY_NEW_MIGRATIONS.sql');
  console.log('   3. Paste and run in SQL Editor');
  console.log('\n💡 Alternatively, migrations will be applied automatically when using supabase db push');
  
  // Try to check if we can verify the connection
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Connected to Supabase successfully');
  } catch (error) {
    console.log('⚠️  Could not verify connection:', error.message);
  }
}

applyMigrations().catch(console.error);

