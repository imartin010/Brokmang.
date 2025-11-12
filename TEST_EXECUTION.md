# Test Execution Guide

## Pre-Test Setup

### 1. Verify Environment
```bash
# Check if dev server is running
curl http://localhost:3000

# Check if build passes
npm run build

# Verify environment variables
cat .env.local | grep -E "SUPABASE|OPENAI"
```

### 2. Test Data Requirements
- Organization: Brokmang (ID: `3664ed88-2563-4abf-81e3-3cf405dd7580`)
- Test User: themartining@gmail.com (CEO role)
- At least one business unit
- At least one team
- At least one agent
- Sample deals, leads, requests

## Test Execution

### Phase 1: Authentication & Access Control (5 minutes)

#### Test 1.1: Sign In
- [ ] Navigate to `http://localhost:3000/sign-in`
- [ ] Enter email: `themartining@gmail.com`
- [ ] Enter password: `forgetit1`
- [ ] Click "Sign in"
- [ ] **Expected**: Redirected to `/app/executive` (CEO dashboard)
- [ ] **Verify**: User name "Martin" appears in header
- [ ] **Verify**: No console errors

#### Test 1.2: Role-Based Routing
- [ ] As CEO, verify access to `/app/executive`
- [ ] As CEO, verify access to `/app/admin`
- [ ] Try accessing `/app/agent` (should redirect to `/app/executive`)
- [ ] **Verify**: Unauthorized routes are blocked

#### Test 1.3: Sign Out
- [ ] Click "Sign out" button
- [ ] **Expected**: Redirected to `/sign-in`
- [ ] **Verify**: Session is cleared

### Phase 2: Sales Agent Features (15 minutes)

**Note**: Need to create a test agent user or temporarily change CEO role to test agent features.

#### Test 2.1: Check-In/Check-Out
- [ ] Navigate to `/app/agent`
- [ ] Click "Check In" button
- [ ] **Verify**: Check-in time is recorded
- [ ] **Verify**: Location is captured (if available)
- [ ] **Verify**: Status shows "Checked In"
- [ ] Click "Check Out" button
- [ ] **Verify**: Check-out time is recorded
- [ ] **Verify**: Hours worked is calculated

#### Test 2.2: Daily Metrics
- [ ] Update daily metrics (calls, mood)
- [ ] **Verify**: Metrics are saved
- [ ] **Verify**: Metrics display correctly

#### Test 2.3: Deal Creation
- [ ] Click "Create Deal" button
- [ ] Fill in deal form:
  - Name: "Test Deal"
  - Value: 100000
  - Stage: "Prospecting"
  - Source: "Lead"
  - Probability: 25%
- [ ] Submit form
- [ ] **Verify**: Deal appears in deals table
- [ ] **Verify**: Deal source is saved correctly

#### Test 2.4: Lead Creation
- [ ] Click "Create Lead" button
- [ ] Fill in lead form
- [ ] Submit form
- [ ] **Verify**: Lead is created
- [ ] **Verify**: Lead appears in leads list

#### Test 2.5: Client Request
- [ ] Click "Submit Request" button
- [ ] Fill in request form
- [ ] Submit form
- [ ] **Verify**: Request is submitted
- [ ] **Verify**: Request status is "pending"

#### Test 2.6: Meeting Scheduling
- [ ] Click "Schedule Meeting" button
- [ ] Fill in meeting form
- [ ] Submit form
- [ ] **Verify**: Meeting is scheduled
- [ ] **Verify**: Meeting appears in calendar

#### Test 2.7: Deals Table
- [ ] View deals table
- [ ] **Verify**: All deals display correctly
- [ ] **Verify**: Deal stages are shown
- [ ] **Verify**: Deal values are formatted correctly

#### Test 2.8: Recent Activity
- [ ] View recent activity section
- [ ] **Verify**: Activities are displayed
- [ ] **Verify**: Activities are grouped by date
- [ ] **Verify**: Activity types are shown (call, meeting, note)

#### Test 2.9: Agent Report
- [ ] Click "Generate Report" button
- [ ] Select date range
- [ ] **Verify**: Report generates successfully
- [ ] **Verify**: Report data is accurate
- [ ] **Verify**: Export works (JSON)

### Phase 3: Team Leader Features (15 minutes)

#### Test 3.1: Team Dashboard
- [ ] Navigate to `/app/leader`
- [ ] **Verify**: Team stats display (open deals, pipeline, closed value, commission)
- [ ] **Verify**: Team performance cards show
- [ ] **Verify**: Member performance shows

#### Test 3.2: Pending Requests
- [ ] View pending requests list
- [ ] **Verify**: Requests from team members show
- [ ] Click "Approve" on a request
- [ ] **Verify**: Request status changes to "approved"
- [ ] Click "Reject" on a request
- [ ] **Verify**: Request status changes to "rejected"

#### Test 3.3: Agent Supervision
- [ ] View agent supervision panel
- [ ] **Verify**: Agents are listed
- [ ] Toggle supervision mode for an agent
- [ ] **Verify**: Supervision status is saved
- [ ] **Verify**: Supervision status displays correctly

#### Test 3.4: Daily Agent Rating
- [ ] Click "Submit Rating" button
- [ ] Select an agent
- [ ] Enter rating (1-5)
- [ ] Add notes
- [ ] Submit form
- [ ] **Verify**: Rating is saved
- [ ] **Verify**: Rating appears in agent's profile

#### Test 3.5: Team Management
- [ ] View team management panel
- [ ] Click "Add Member" button
- [ ] Select an agent
- [ ] **Verify**: Agent is added to team
- [ ] Click "Remove Member" button
- [ ] **Verify**: Agent is removed from team

#### Test 3.6: Team Reports
- [ ] Click "Generate Team Report" button
- [ ] Select date range
- [ ] **Verify**: Report generates successfully
- [ ] **Verify**: Report includes team metrics
- [ ] **Verify**: Report includes member performance

#### Test 3.7: Agent Reports
- [ ] Click "Generate Agent Report" button
- [ ] Select date range
- [ ] **Verify**: Report generates successfully
- [ ] **Verify**: Report includes agent metrics

#### Test 3.8: AI Insights
- [ ] Click "Generate Insight" button
- [ ] **Verify**: Insight generation starts
- [ ] **Verify**: Loading state shows
- [ ] **Verify**: Insight is generated (if API key is set)
- [ ] **Verify**: Insight displays correctly
- [ ] **Verify**: Insight history shows

### Phase 4: Sales Manager Features (10 minutes)

#### Test 4.1: Manager Dashboard
- [ ] Navigate to `/app/manager`
- [ ] **Verify**: Multi-team view displays
- [ ] **Verify**: Team comparison works
- [ ] **Verify**: Agent performance across teams shows

#### Test 4.2: Team Reports
- [ ] Generate team report
- [ ] **Verify**: Report includes all teams
- [ ] **Verify**: Team comparison data is accurate

#### Test 4.3: Agent Reports
- [ ] Generate agent report
- [ ] **Verify**: Report includes agents from all teams
- [ ] **Verify**: Agent performance data is accurate

#### Test 4.4: AI Insights
- [ ] Generate AI insight
- [ ] **Verify**: Insight is generated
- [ ] **Verify**: Insight includes multi-team analysis

### Phase 5: Finance Features (15 minutes)

#### Test 5.1: Finance Dashboard
- [ ] Navigate to `/app/finance`
- [ ] **Verify**: Finance metrics display
- [ ] **Verify**: Cost trends show
- [ ] **Verify**: Revenue trends show

#### Test 5.2: Fixed Costs
- [ ] Click "Add Fixed Cost" button
- [ ] Fill in cost form
- [ ] Submit form
- [ ] **Verify**: Cost is saved
- [ ] **Verify**: Cost appears in costs list

#### Test 5.3: Variable Costs
- [ ] Click "Add Variable Cost" button
- [ ] Fill in cost form
- [ ] Submit form
- [ ] **Verify**: Cost is saved
- [ ] **Verify**: Cost appears in costs list

#### Test 5.4: Salary Management
- [ ] Click "Add Salary" button
- [ ] Select an employee
- [ ] Enter salary amount
- [ ] Submit form
- [ ] **Verify**: Salary is saved
- [ ] **Verify**: Salary appears in salaries list

#### Test 5.5: Commission Configuration
- [ ] Click "Configure Commission" button
- [ ] Update commission rates
- [ ] Submit form
- [ ] **Verify**: Commission rates are saved
- [ ] **Verify**: Commission rates are applied to calculations

#### Test 5.6: Tax Configuration
- [ ] Click "Configure Tax" button
- [ ] Update tax rates
- [ ] Submit form
- [ ] **Verify**: Tax rates are saved
- [ ] **Verify**: Tax rates are applied to calculations

#### Test 5.7: P&L Statement
- [ ] View P&L statement
- [ ] **Verify**: Revenue is calculated correctly
- [ ] **Verify**: Costs are calculated correctly
- [ ] **Verify**: Profit/Loss is calculated correctly
- [ ] **Verify**: P&L statement displays correctly

#### Test 5.8: Finance Reports
- [ ] Generate finance report
- [ ] **Verify**: Report includes financial metrics
- [ ] **Verify**: Report includes cost breakdown
- [ ] **Verify**: Report includes revenue breakdown

#### Test 5.9: AI Insights
- [ ] Generate AI insight
- [ ] **Verify**: Insight is generated
- [ ] **Verify**: Insight includes financial analysis

### Phase 6: Business Unit Head Features (10 minutes)

#### Test 6.1: BU Dashboard
- [ ] Navigate to `/app/business-unit`
- [ ] **Verify**: BU performance metrics display
- [ ] **Verify**: BU financial metrics display
- [ ] **Verify**: Team performance in BU shows

#### Test 6.2: BU P&L
- [ ] View BU P&L statement
- [ ] **Verify**: P&L is calculated for BU only
- [ ] **Verify**: P&L includes BU revenue and costs

#### Test 6.3: BU Reports
- [ ] Generate BU report
- [ ] **Verify**: Report includes BU metrics
- [ ] **Verify**: Report includes team performance

#### Test 6.4: AI Insights
- [ ] Generate AI insight
- [ ] **Verify**: Insight is generated
- [ ] **Verify**: Insight includes BU analysis

### Phase 7: CEO Features (10 minutes)

#### Test 7.1: Executive Dashboard
- [ ] Navigate to `/app/executive`
- [ ] **Verify**: Organization overview displays
- [ ] **Verify**: All BUs show
- [ ] **Verify**: BU comparison works
- [ ] **Verify**: Organization P&L shows

#### Test 7.2: Organization Metrics
- [ ] View organization metrics
- [ ] **Verify**: Total revenue is calculated
- [ ] **Verify**: Total costs are calculated
- [ ] **Verify**: Total profit/loss is calculated

#### Test 7.3: BU Comparison
- [ ] View BU comparison
- [ ] **Verify**: BU performance is compared
- [ ] **Verify**: BU financial metrics are compared

#### Test 7.4: AI Insights
- [ ] Generate AI insight
- [ ] **Verify**: Insight is generated
- [ ] **Verify**: Insight includes executive summary

### Phase 8: Admin Features (5 minutes)

#### Test 8.1: Admin Dashboard
- [ ] Navigate to `/app/admin`
- [ ] **Verify**: Organization list displays
- [ ] **Verify**: Organization metrics show
- [ ] **Verify**: Cross-org data displays

#### Test 8.2: Organization Management
- [ ] View organization details
- [ ] **Verify**: Organization data is accurate
- [ ] **Verify**: Organization metrics are calculated

### Phase 9: AI Insights (10 minutes)

#### Test 9.1: Team Leader Insights
- [ ] As team leader, generate insight
- [ ] **Verify**: Insight is generated
- [ ] **Verify**: Insight includes team analysis
- [ ] **Verify**: Insight includes coaching recommendations

#### Test 9.2: Sales Manager Insights
- [ ] As sales manager, generate insight
- [ ] **Verify**: Insight is generated
- [ ] **Verify**: Insight includes multi-team analysis
- [ ] **Verify**: Insight includes resource allocation recommendations

#### Test 9.3: Finance Insights
- [ ] As finance, generate insight
- [ ] **Verify**: Insight is generated
- [ ] **Verify**: Insight includes financial analysis
- [ ] **Verify**: Insight includes cost optimization recommendations

#### Test 9.4: BU Head Insights
- [ ] As BU head, generate insight
- [ ] **Verify**: Insight is generated
- [ ] **Verify**: Insight includes BU analysis
- [ ] **Verify**: Insight includes strategic recommendations

#### Test 9.5: CEO Insights
- [ ] As CEO, generate insight
- [ ] **Verify**: Insight is generated
- [ ] **Verify**: Insight includes executive summary
- [ ] **Verify**: Insight includes cross-BU analysis

#### Test 9.6: Insight History
- [ ] View insight history
- [ ] **Verify**: Recent insights are displayed
- [ ] **Verify**: Insight status is shown (completed, pending, failed)
- [ ] **Verify**: Insight content is displayed

#### Test 9.7: Error Handling
- [ ] Test with invalid API key (if possible)
- [ ] **Verify**: Error message is displayed
- [ ] **Verify**: Error is handled gracefully
- [ ] **Verify**: User can retry

### Phase 10: Reports (10 minutes)

#### Test 10.1: Agent Reports
- [ ] Generate agent report
- [ ] Select different date ranges (daily, weekly, monthly, quarterly, yearly)
- [ ] **Verify**: Report generates for each period
- [ ] **Verify**: Report data is accurate
- [ ] **Verify**: Export works (JSON)

#### Test 10.2: Team Reports
- [ ] Generate team report
- [ ] Select different date ranges
- [ ] **Verify**: Report generates for each period
- [ ] **Verify**: Report data is accurate
- [ ] **Verify**: Export works (JSON)

#### Test 10.3: BU Reports
- [ ] Generate BU report
- [ ] Select different date ranges
- [ ] **Verify**: Report generates for each period
- [ ] **Verify**: Report data is accurate
- [ ] **Verify**: Export works (JSON)

#### Test 10.4: Date Range Filtering
- [ ] Test custom date range
- [ ] **Verify**: Report filters by date range
- [ ] **Verify**: Report data is accurate for date range

#### Test 10.5: Role-Based Access
- [ ] Test report access from different roles
- [ ] **Verify**: Agents can only see their own reports
- [ ] **Verify**: Team leaders can see their team reports
- [ ] **Verify**: Managers can see all team reports
- [ ] **Verify**: BU heads can see their BU reports
- [ ] **Verify**: CEOs can see all reports

### Phase 11: Data Integrity (10 minutes)

#### Test 11.1: Organization Isolation
- [ ] Create test data in Organization A
- [ ] Switch to Organization B
- [ ] **Verify**: Organization B cannot see Organization A's data
- [ ] **Verify**: RLS policies enforce isolation

#### Test 11.2: Deal Ownership
- [ ] Create a deal as Agent A
- [ ] View deals as Agent B
- [ ] **Verify**: Agent B cannot see Agent A's deals
- [ ] **Verify**: Team leader can see team member deals

#### Test 11.3: Team Membership
- [ ] Add agent to team
- [ ] **Verify**: Agent appears in team member list
- [ ] **Verify**: Team leader can see agent's data
- [ ] Remove agent from team
- [ ] **Verify**: Agent is removed from team member list

#### Test 11.4: Audit Trails
- [ ] Create a deal
- [ ] **Verify**: Activity log is created
- [ ] Update a deal
- [ ] **Verify**: Activity log is updated
- [ ] **Verify**: Audit trail is maintained

## Test Results Summary

### Passed: [ ]
### Failed: [ ]
### Issues Found: [ ]

## Notes
- Test execution date: [To be filled]
- Tester: [To be filled]
- Environment: Development / Production
- Browser: [To be filled]
- OS: [To be filled]

