#!/usr/bin/env node

/**
 * Script to create test users in Supabase Auth
 * This script uses the Supabase service role key to create users
 * 
 * Usage:
 *   node scripts/create-test-users.js
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

// Note: This script requires @supabase/supabase-js and dotenv
// Install with: npm install dotenv
// Or use Supabase Auth UI to create users manually

try {
  var { createClient } = require('@supabase/supabase-js');
  var dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
} catch (error) {
  console.error('Error: Please install required dependencies:');
  console.error('  npm install dotenv');
  console.error('');
  console.error('Alternatively, create users manually in Supabase Auth UI.');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  { email: 'admin1@test.com', password: 'testpassword123', name: 'Admin User', role: 'admin' },
  { email: 'finance1@test.com', password: 'testpassword123', name: 'Finance Manager', role: 'finance' },
  { email: 'buhead1@test.com', password: 'testpassword123', name: 'BU Head - City Central', role: 'business_unit_head' },
  { email: 'manager1@test.com', password: 'testpassword123', name: 'Sales Manager', role: 'sales_manager' },
  { email: 'leader1@test.com', password: 'testpassword123', name: 'Team Leader Alpha', role: 'team_leader' },
  { email: 'leader2@test.com', password: 'testpassword123', name: 'Team Leader Beta', role: 'team_leader' },
  { email: 'agent1@test.com', password: 'testpassword123', name: 'Sales Agent 1', role: 'sales_agent' },
  { email: 'agent2@test.com', password: 'testpassword123', name: 'Sales Agent 2', role: 'sales_agent' },
  { email: 'agent3@test.com', password: 'testpassword123', name: 'Sales Agent 3', role: 'sales_agent' },
  { email: 'agent4@test.com', password: 'testpassword123', name: 'Sales Agent 4', role: 'sales_agent' },
  { email: 'ceo1@test.com', password: 'testpassword123', name: 'CEO User', role: 'ceo' },
];

async function createTestUsers() {
  console.log('Creating test users...\n');

  const results = {
    created: [],
    existing: [],
    errors: []
  };

  for (const user of testUsers) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(user.email);
      
      if (existingUser?.user) {
        console.log(`✓ User already exists: ${user.email}`);
        results.existing.push(user.email);
        continue;
      }

      // Create user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.name,
          role: user.role
        }
      });

      if (error) {
        console.error(`✗ Error creating ${user.email}:`, error.message);
        results.errors.push({ email: user.email, error: error.message });
      } else {
        console.log(`✓ Created user: ${user.email} (${user.role})`);
        results.created.push(user.email);
      }
    } catch (error) {
      console.error(`✗ Error creating ${user.email}:`, error.message);
      results.errors.push({ email: user.email, error: error.message });
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Created: ${results.created.length} users`);
  console.log(`Existing: ${results.existing.length} users`);
  console.log(`Errors: ${results.errors.length} users`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(({ email, error }) => {
      console.log(`  - ${email}: ${error}`);
    });
  }

  if (results.created.length > 0 || results.existing.length > 0) {
    console.log('\n✓ Users are ready! Now run the seed script:');
    console.log('  supabase/seeds/mock_data_supabase.sql');
  }
}

createTestUsers().catch(console.error);

