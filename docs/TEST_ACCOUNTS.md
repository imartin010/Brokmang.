# Test Accounts Guide

This document provides information about test accounts for the Brokmang platform.

## Test Account Credentials

All test accounts use the password: **`testpassword123`**

### User Accounts

| Email | Role | Name | Description |
|-------|------|------|-------------|
| `themartining@gmail.com` | CEO | CEO User | Existing CEO account |
| `admin1@test.com` | Admin | Admin User | System administrator |
| `finance1@test.com` | Finance | Finance Manager | Finance team member |
| `buhead1@test.com` | Business Unit Head | BU Head - City Central | Business unit leader |
| `manager1@test.com` | Sales Manager | Sales Manager | Sales manager |
| `leader1@test.com` | Team Leader | Team Leader Alpha | Team leader for Alpha Team |
| `leader2@test.com` | Team Leader | Team Leader Beta | Team leader for Beta Team |
| `agent1@test.com` | Sales Agent | Sales Agent 1 | Sales agent in Alpha Team |
| `agent2@test.com` | Sales Agent | Sales Agent 2 | Sales agent in Alpha Team |
| `agent3@test.com` | Sales Agent | Sales Agent 3 | Sales agent in Beta Team |
| `agent4@test.com` | Sales Agent | Sales Agent 4 | Sales agent in Beta Team |

## Setting Up Test Accounts

### Option 1: Using Supabase Auth UI (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create New User**
4. For each test account:
   - Enter the email address
   - Enter password: `testpassword123`
   - Click **Create User**
5. After creating all users, run the seed script:
   ```sql
   -- Run this in Supabase SQL Editor
   -- File: supabase/seeds/mock_data_supabase.sql
   ```

### Option 2: Using the Application

1. Login as CEO or Admin
2. Go to Admin dashboard
3. Use the "Invite User" feature to create test accounts
4. The seed script will automatically link profiles to users

### Option 3: Using Supabase CLI (Advanced)

```bash
# Create users via Supabase Auth API
# This requires the Supabase service role key
```

## Seed Data Overview

After running the seed script, the following test data will be created:

### Business Units
- **City Central BU**: Urban properties business unit
- **Coastal BU**: Coastal properties business unit

### Teams
- **Alpha Team**: Led by `leader1@test.com`, includes `agent1@test.com` and `agent2@test.com`
- **Beta Team**: Led by `leader2@test.com`, includes `agent3@test.com` and `agent4@test.com`

### Deals
- Multiple deals across different stages (won, negotiation, qualified, prospecting)
- Deal values ranging from 1.5M to 15M EGP
- Various deal sources (Lead, Referral, Website)

### Leads
- Leads in various statuses (new, contacted, qualified)
- Different property types (Villa, Apartment, Penthouse, etc.)
- Various destinations (New Cairo, Maadi, Heliopolis, etc.)

### Client Requests
- Approved, pending, and rejected requests
- Various project types and budgets
- Linked to agents and team leaders

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

## Testing Scenarios

### Sales Agent Testing
1. **Login** as `agent1@test.com`
2. **Check in/out** - Test attendance tracking
3. **View dashboard** - Check KPIs and metrics
4. **Create deals** - Test deal creation
5. **Create leads** - Test lead management
6. **Create client requests** - Test request submission
7. **Schedule meetings** - Test meeting scheduling
8. **Update daily metrics** - Test metrics tracking

### Team Leader Testing
1. **Login** as `leader1@test.com`
2. **View team dashboard** - Check team performance
3. **Approve/reject requests** - Test request management
4. **Rate agents** - Test daily ratings
5. **Manage team members** - Test team management
6. **View agent supervision** - Test supervision features
7. **Generate reports** - Test report generation

### Sales Manager Testing
1. **Login** as `manager1@test.com`
2. **View multi-team dashboard** - Check team comparisons
3. **View team performance** - Test team analytics
4. **Generate reports** - Test team and agent reports
5. **View AI insights** - Test AI recommendations

### Business Unit Head Testing
1. **Login** as `buhead1@test.com`
2. **View BU dashboard** - Check BU performance
3. **View P&L statements** - Test financial views
4. **Generate BU reports** - Test BU reports
5. **View AI insights** - Test strategic insights

### Finance Testing
1. **Login** as `finance1@test.com`
2. **Add costs** - Test cost entry
3. **Manage salaries** - Test salary management
4. **Configure commissions** - Test commission setup
5. **Configure taxes** - Test tax configuration
6. **View P&L** - Test P&L statements
7. **View AI insights** - Test financial insights

### CEO/Admin Testing
1. **Login** as `themartining@gmail.com` or `admin1@test.com`
2. **View organization overview** - Check organization-wide metrics
3. **View BU comparisons** - Test cross-BU analytics
4. **Generate reports** - Test organization reports
5. **View AI insights** - Test executive insights
6. **Manage users** - Test user management (Admin only)

## Important Notes

1. **User Creation**: Users must be created in Supabase Auth before running the seed script
2. **User IDs**: The seed script automatically fetches user IDs from `auth.users` table by email
3. **Organization ID**: Make sure the organization ID in the seed script matches your organization
4. **Password**: All test accounts use the same password for convenience: `testpassword123`
5. **Data Refresh**: To reset test data, delete existing data and run the seed script again

## Troubleshooting

### Users Not Found
If the seed script reports "users not found":
1. Verify users are created in Supabase Auth
2. Check email addresses match exactly
3. Run the seed script again after creating users

### Profile Creation Failed
If profiles are not created:
1. Check if users exist in `auth.users` table
2. Verify organization ID is correct
3. Check RLS policies allow profile creation

### Data Not Showing
If test data is not visible:
1. Verify RLS policies are correct
2. Check user roles are set correctly
3. Ensure users are assigned to correct teams/BUs

## Security Notes

⚠️ **Important**: These are test accounts with weak passwords. **Never use these credentials in production!**

- Change all passwords before deploying to production
- Use strong, unique passwords for production accounts
- Enable additional security measures (2FA, etc.) in production
- Regularly rotate passwords in production environments

