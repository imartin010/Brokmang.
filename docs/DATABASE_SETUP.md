# Database Setup Guide

This guide explains how to set up and verify the database for the Brokmang platform.

## Prerequisites

1. Supabase project created
2. Database URL and service role key available
3. Environment variables configured in `.env.local`

## Setup Steps

### Step 1: Apply Migrations

1. **Using Supabase SQL Editor** (Recommended):
   - Open your Supabase project dashboard
   - Navigate to **SQL Editor**
   - Run the master migration script:
     ```sql
     -- File: supabase/APPLY_NEW_MIGRATIONS.sql
     ```
   - This applies all migrations in the correct order

2. **Using Supabase CLI** (Advanced):
   ```bash
   supabase db push
   ```

### Step 2: Verify Migrations

Run the verification script to ensure all migrations are applied correctly:

```sql
-- File: supabase/seeds/verify_database.sql
-- Run this in Supabase SQL Editor
```

The script will check:
- ✅ All required tables exist
- ✅ All required views exist
- ✅ RLS is enabled on all tables
- ✅ Required indexes exist
- ✅ Organization exists
- ✅ Deal sources exist
- ✅ Commission and tax configurations exist
- ✅ RLS policies exist
- ✅ Required functions exist

### Step 3: Seed Default Configuration

Run the default configuration seed script:

```sql
-- File: supabase/seeds/default_config.sql
-- Run this in Supabase SQL Editor
```

This creates:
- Deal sources (Lead, Cold Call, Company Data, etc.)
- Default commission rates for all roles
- Default tax configuration
- Developer commission rates

### Step 4: Create Test Users

**Option A: Using Supabase Auth UI** (Recommended)
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Create users with emails from `docs/TEST_ACCOUNTS.md`
4. Password for all test accounts: `testpassword123`

**Option B: Using Script** (Advanced)
```bash
node scripts/create-test-users.js
```

### Step 5: Seed Mock Data

After creating test users, run the mock data seed script:

```sql
-- File: supabase/seeds/mock_data_supabase.sql
-- Run this in Supabase SQL Editor
```

This creates:
- Business units
- Teams
- User profiles
- Deals, leads, client requests
- Meetings
- Attendance logs
- Daily metrics
- Agent ratings
- Cost entries
- Employee salaries
- Deal activities

## Database Structure

### Core Tables

- **organizations**: Root organizations
- **business_units**: Business units within organizations
- **teams**: Sales teams within business units
- **profiles**: User profiles (linked to auth.users)
- **team_members**: Team membership assignments
- **deals**: Sales deals/opportunities
- **deal_sources**: Deal source channels
- **deal_activities**: Deal activity timeline
- **attendance_logs**: Agent attendance tracking
- **client_requests**: Client property requests
- **daily_agent_metrics**: Daily agent performance metrics
- **meetings**: Agent meetings and appointments
- **leads**: Lead tracking
- **agent_daily_ratings**: Daily agent ratings by team leaders
- **agent_supervision**: Agent supervision tracking
- **cost_entries**: Fixed and variable costs
- **employee_salaries**: Employee salary records
- **commission_config**: Commission rate configurations
- **tax_config**: Tax rate configurations
- **ai_insight_runs**: AI insight generation logs

### Key Views

- **agent_dashboard_summary**: Agent dashboard data
- **team_leader_dashboard**: Team leader dashboard data
- **team_member_performance**: Team member performance metrics
- **business_unit_finance_overview**: BU financial overview
- **organization_overview**: Organization-wide overview
- **attendance_today**: Today's attendance summary
- **upcoming_meetings**: Upcoming meetings view
- **pnl_overview**: P&L overview
- **pnl_monthly_summary**: Monthly P&L summary
- **agent_performance_report**: Agent performance reports
- **team_performance_report**: Team performance reports
- **business_unit_combined_report**: BU combined reports
- **ai_insight_recent**: Recent AI insights

## Row Level Security (RLS)

All tables have RLS enabled with role-based access policies:

- **Agents**: Can only access their own data
- **Team Leaders**: Can access their team's data
- **Sales Managers**: Can access multiple teams' data
- **Business Unit Heads**: Can access their BU's data
- **Finance**: Can access financial data
- **CEO/Admin**: Can access all organization data

## Indexes

Key indexes are created for performance:

- **deals**: organization_id, agent_id, stage, expected_close_date
- **attendance_logs**: agent_id, work_date, organization_id
- **leads**: agent_id, team_id, status, source_id, received_date
- **meetings**: agent_id, meeting_date, status, organization_id
- **client_requests**: agent_id, team_id, status, organization_id

## Verification Checklist

After setup, verify:

- [ ] All migrations applied successfully
- [ ] All tables exist
- [ ] All views exist
- [ ] RLS is enabled on all tables
- [ ] RLS policies are created
- [ ] Indexes are created
- [ ] Organization exists
- [ ] Deal sources exist
- [ ] Commission config exists
- [ ] Tax config exists
- [ ] Test users created
- [ ] Mock data seeded
- [ ] Can login with test accounts
- [ ] Dashboards load correctly
- [ ] Data is visible for each role

## Troubleshooting

### Migration Errors

If migrations fail:
1. Check error messages in Supabase SQL Editor
2. Verify previous migrations were applied
3. Check for conflicting objects
4. Review migration files for syntax errors

### RLS Issues

If data is not visible:
1. Verify RLS is enabled: `SELECT * FROM pg_tables WHERE tablename = 'table_name' AND rowsecurity = true;`
2. Check policies exist: `SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'table_name';`
3. Verify user roles are correct in profiles table
4. Check team memberships are correct

### Missing Data

If data is missing:
1. Verify seed scripts were run
2. Check organization ID matches
3. Verify user IDs are correct
4. Check RLS policies allow access
5. Verify user roles are set correctly

### Performance Issues

If queries are slow:
1. Verify indexes exist
2. Check index usage: `EXPLAIN ANALYZE <query>`
3. Create additional indexes if needed
4. Review query patterns

## Maintenance

### Regular Tasks

1. **Monitor RLS Policies**: Ensure policies are working correctly
2. **Check Indexes**: Verify indexes are being used
3. **Review Performance**: Monitor slow queries
4. **Update Configurations**: Update commission and tax rates as needed
5. **Backup Data**: Regularly backup database

### Adding New Migrations

1. Create migration file: `supabase/migrations/00XX_description.sql`
2. Test migration locally
3. Apply to staging environment
4. Verify migration works correctly
5. Apply to production environment
6. Update `APPLY_NEW_MIGRATIONS.sql` if needed

## Security Notes

- ⚠️ **Never expose service role key** in client-side code
- ⚠️ **Use RLS policies** to enforce data access control
- ⚠️ **Regularly review** RLS policies for security
- ⚠️ **Monitor** database access logs
- ⚠️ **Keep** Supabase client libraries updated

## Support

For issues or questions:
1. Check this documentation
2. Review migration files
3. Check Supabase logs
4. Verify RLS policies
5. Contact development team

