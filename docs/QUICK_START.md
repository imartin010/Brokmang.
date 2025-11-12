# Quick Start Guide

This guide will help you quickly set up and test the Brokmang platform.

## Prerequisites

- Node.js 18+ installed
- Supabase project created
- Environment variables configured (`.env.local`)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Verify Database

1. Open Supabase SQL Editor
2. Run: `supabase/seeds/verify_database.sql`
3. Verify all checks pass

### 3. Seed Default Configuration

1. In Supabase SQL Editor
2. Run: `supabase/seeds/default_config.sql`
3. Verify deal sources and configurations are created

### 4. Create Test Users

**Option A: Using Supabase Auth UI** (Recommended)
1. Go to **Authentication** → **Users**
2. Create users with emails from `docs/TEST_ACCOUNTS.md`
3. Password for all: `testpassword123`

**Option B: Using Script**
```bash
node scripts/create-test-users.js
```

### 5. Seed Mock Data

1. In Supabase SQL Editor
2. Run: `supabase/seeds/mock_data_supabase.sql`
3. Verify data is created

### 6. Start Development Server

```bash
npm run dev
```

### 7. Test Application

1. Open browser: `http://localhost:3000`
2. Login with test account (e.g., `agent1@test.com` / `testpassword123`)
3. Test dashboard and features

## Test Accounts

All passwords: **`testpassword123`**

- `agent1@test.com` - Sales Agent
- `leader1@test.com` - Team Leader
- `manager1@test.com` - Sales Manager
- `buhead1@test.com` - Business Unit Head
- `finance1@test.com` - Finance
- `themartining@gmail.com` - CEO
- `admin1@test.com` - Admin

See `docs/TEST_ACCOUNTS.md` for complete list.

## Common Issues

### Users Not Found
- Verify users are created in Supabase Auth
- Check email addresses match exactly
- Run seed script again

### Data Not Visible
- Check RLS policies are correct
- Verify user roles are set correctly
- Ensure users are assigned to teams/BUs

### Build Errors
- Run `npm run build` to see errors
- Check TypeScript errors
- Verify all dependencies are installed

## Next Steps

1. Test all role dashboards
2. Verify key user flows
3. Check for UI/UX issues
4. Test API endpoints
5. Review documentation

## Support

For detailed setup instructions, see:
- `docs/DATABASE_SETUP.md` - Database setup guide
- `docs/TEST_ACCOUNTS.md` - Test accounts guide
- `QA_SUMMARY.md` - QA testing summary

