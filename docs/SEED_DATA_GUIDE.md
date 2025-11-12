# Seed Data Setup Guide

This guide explains how to set up test data for the Brokmang platform.

## Prerequisites

1. All migrations applied successfully
2. Default configuration seeded (`supabase/seeds/default_config.sql`)
3. Organization exists in database

## Step-by-Step Setup

### Step 1: Verify Database Structure

Run the database verification script to ensure all tables, views, and policies exist:

```sql
-- File: supabase/seeds/verify_database.sql
-- Run this in Supabase SQL Editor
```

This will check:
- ✅ All required tables exist
- ✅ All required views exist
- ✅ RLS is enabled on all tables
- ✅ Required indexes exist
- ✅ Organization exists
- ✅ Deal sources exist
- ✅ Commission and tax configurations exist
- ✅ RLS policies exist
- ✅ Required functions exist

### Step 2: Create Test Users

**Option A: Using Supabase Auth UI** (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create New User**
4. For each test account:
   - Email: (see test accounts list below)
   - Password: `testpassword123`
   - Auto Confirm User: ✅ (checked)
   - Click **Create User**

**Option B: Using Script**

```bash
# Install dotenv if not already installed
npm install dotenv

# Run the script
node scripts/create-test-users.js
```

**Test Accounts to Create:**

- `admin1@test.com` - Admin
- `finance1@test.com` - Finance
- `buhead1@test.com` - Business Unit Head
- `manager1@test.com` - Sales Manager
- `leader1@test.com` - Team Leader
- `leader2@test.com` - Team Leader
- `agent1@test.com` - Sales Agent
- `agent2@test.com` - Sales Agent
- `agent3@test.com` - Sales Agent
- `agent4@test.com` - Sales Agent
- `ceo1@test.com` - CEO (optional, if you want a separate CEO account)

### Step 3: Seed Mock Data

After creating test users, run the mock data seed script:

```sql
-- File: supabase/seeds/mock_data_supabase.sql
-- Run this in Supabase SQL Editor
```

**What This Script Does:**

1. **Automatically fetches user IDs** from `auth.users` by email
2. Creates business units (City Central BU, Coastal BU)
3. Creates user profiles for all test users
4. Creates teams (Alpha Team, Beta Team)
5. Assigns agents to teams
6. Creates deals (10+ deals across various stages)
7. Creates leads (8+ leads)
8. Creates client requests (5+ requests)
9. Creates meetings (6+ meetings)
10. Creates attendance logs (14 days for all agents)
11. Creates daily metrics (7 days for all agents)
12. Creates agent ratings (7 days)
13. Creates cost entries (8+ entries)
14. Creates employee salaries (9+ salaries)
15. Creates deal activities (8+ activities)

**Important Notes:**

- The script automatically looks up user IDs from `auth.users` by email
- If a user doesn't exist, that user's data will be skipped (no error)
- The script is idempotent (safe to run multiple times)
- Data is created only if it doesn't already exist (using `ON CONFLICT DO NOTHING`)

### Step 4: Verify Seed Data

After running the seed script, verify the data was created:

```sql
-- Check users
SELECT email, role FROM public.profiles ORDER BY role, email;

-- Check business units
SELECT name, leader_id FROM public.business_units;

-- Check teams
SELECT name, leader_id FROM public.teams;

-- Check deals
SELECT COUNT(*) as deal_count, stage FROM public.deals GROUP BY stage;

-- Check attendance
SELECT COUNT(*) as attendance_count FROM public.attendance_logs;

-- Check metrics
SELECT COUNT(*) as metrics_count FROM public.daily_agent_metrics;
```

## Test Data Overview

### Business Units
- **City Central BU**: Urban properties business unit
- **Coastal BU**: Coastal properties business unit

### Teams
- **Alpha Team**: Led by `leader1@test.com`
  - Members: `agent1@test.com`, `agent2@test.com`
- **Beta Team**: Led by `leader2@test.com`
  - Members: `agent3@test.com`, `agent4@test.com`

### Deals
- Multiple deals across different stages:
  - Won deals (closed successfully)
  - Negotiation deals (in progress)
  - Qualified deals (qualified leads)
  - Prospecting deals (new opportunities)
- Deal values range from 1.5M to 15M EGP
- Various deal sources (Lead, Referral, Website)

### Leads
- Leads in various statuses:
  - New leads
  - Contacted leads
  - Qualified leads
- Different property types (Villa, Apartment, Penthouse, etc.)
- Various destinations (New Cairo, Maadi, Heliopolis, etc.)

### Client Requests
- Approved requests (ready to convert to deals)
- Pending requests (awaiting approval)
- Rejected requests (with rejection reasons)
- Various project types and budgets

### Meetings
- Upcoming scheduled meetings
- Completed meetings with outcomes
- Linked to deals and client requests

### Attendance Logs
- Last 14 days of attendance for all agents
- Check-in and check-out times
- Location tracking

### Daily Metrics
- Last 7 days of daily metrics for all agents
- Calls, meetings, requests, deals closed
- Mood tracking and notes

### Agent Ratings
- Last 7 days of daily ratings by team leaders
- Appearance, behavior, and performance ratings
- Comments and feedback

### Financial Data
- Fixed costs (rent, utilities, insurance, software)
- Variable costs (marketing, travel, phone, events)
- Employee salaries for all roles
- Commission and tax configurations

## Troubleshooting

### Users Not Found

If the seed script reports "users not found":
1. Verify users are created in Supabase Auth
2. Check email addresses match exactly
3. Run the seed script again after creating users

### Data Not Created

If data is not created:
1. Check for SQL errors in Supabase SQL Editor
2. Verify organization ID is correct
3. Check if data already exists (script uses `ON CONFLICT DO NOTHING`)
4. Verify RLS policies allow data insertion

### Data Not Visible

If data is not visible after seeding:
1. Check RLS policies are correct
2. Verify user roles are set correctly
3. Ensure users are assigned to correct teams/BUs
4. Check if user is logged in with correct account

## Resetting Test Data

To reset test data:

```sql
-- WARNING: This will delete all test data!
-- Only run this if you want to start fresh

-- Delete test data (keep users and organization)
DELETE FROM public.deal_activities;
DELETE FROM public.agent_daily_ratings;
DELETE FROM public.daily_agent_metrics;
DELETE FROM public.attendance_logs;
DELETE FROM public.meetings;
DELETE FROM public.leads;
DELETE FROM public.client_requests;
DELETE FROM public.deals;
DELETE FROM public.team_members;
DELETE FROM public.teams;
DELETE FROM public.cost_entries;
DELETE FROM public.employee_salaries;

-- Then run the seed script again
```

## Next Steps

After seeding data:
1. Test login with test accounts
2. Verify dashboards load correctly
3. Test key user flows
4. Verify data is visible for each role
5. Test API endpoints
6. Perform end-to-end testing

See `docs/TEST_ACCOUNTS.md` for detailed testing scenarios.

