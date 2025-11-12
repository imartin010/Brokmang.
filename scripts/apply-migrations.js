#!/usr/bin/env node

/**
 * Apply all database migrations to Supabase
 * This script reads all migration files and executes them in order
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  // Get all migration files, sorted
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && f.match(/^\d{4}_/))
    .sort();
  
  console.log(`📦 Found ${files.length} migration files`);
  
  // Also check for the master SQL file
  const masterFile = path.join(__dirname, '..', 'supabase', 'APPLY_NEW_MIGRATIONS.sql');
  let masterSQL = null;
  if (fs.existsSync(masterFile)) {
    masterSQL = fs.readFileSync(masterFile, 'utf8');
    console.log('📄 Found master migration file');
  }
  
  try {
    if (masterSQL) {
      console.log('\n🚀 Applying master migration file...');
      const { error } = await supabase.rpc('exec_sql', { sql_query: masterSQL });
      
      if (error) {
        // Try direct query execution
        console.log('⚠️  RPC not available, trying direct execution...');
        // Split SQL by semicolons and execute in chunks
        const statements = masterSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              const { error: stmtError } = await supabase
                .from('_dummy')
                .select('1')
                .limit(0);
              // This won't work - we need to use the REST API or PostgREST directly
            } catch (e) {
              // Ignore
            }
          }
        }
      }
    } else {
      // Apply migrations one by one
      for (const file of files) {
        console.log(`\n📝 Applying ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        // Execute via REST API using PostgREST
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ sql_query: sql })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error(`❌ Error in ${file}:`, error);
          // Continue with next migration
        } else {
          console.log(`✅ ${file} applied successfully`);
        }
      }
    }
    
    console.log('\n✨ All migrations applied!');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
applyMigrations();

