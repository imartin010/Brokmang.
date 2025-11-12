# Testing Plan - Brokmang Application

## Overview
This document outlines the comprehensive testing plan for all features across all user roles.

## Test Environment Setup
1. ✅ Development server running (`npm run dev`)
2. ✅ Supabase database migrations applied
3. ✅ OpenAI API key configured
4. ✅ Test users created for each role

## Test Roles & Users

### Roles to Test
1. **Sales Agent** - Basic user with deal tracking
2. **Team Leader** - Manages team, approves requests, rates agents
3. **Sales Manager** - Oversees multiple teams
4. **Business Unit Head** - Manages BU performance and finances
5. **Finance** - Manages costs, salaries, commissions, taxes
6. **CEO** - Executive overview
7. **Admin** - Multi-organization management

## Test Categories

### 1. Authentication & Authorization
- [ ] User can sign in
- [ ] User is redirected to correct role dashboard
- [ ] Unauthorized access is blocked
- [ ] Role-based route protection works

### 2. Sales Agent Features
- [ ] Check-in/Check-out functionality
- [ ] Daily metrics tracking (calls, mood)
- [ ] Create deals with source selection
- [ ] Create leads
- [ ] Submit client requests
- [ ] Schedule meetings
- [ ] View own deals table
- [ ] View own performance reports
- [ ] View recent activity

### 3. Team Leader Features
- [ ] View team performance dashboard
- [ ] Approve/reject client requests
- [ ] Manage agent supervision
- [ ] Submit daily agent ratings
- [ ] Add/remove team members
- [ ] View team and agent reports
- [ ] Generate AI insights

### 4. Sales Manager Features
- [ ] View multi-team performance
- [ ] Compare teams side-by-side
- [ ] View agent performance across teams
- [ ] Generate team and agent reports
- [ ] Generate AI insights

### 5. Finance Features
- [ ] Enter fixed costs
- [ ] Enter variable costs
- [ ] Manage employee salaries
- [ ] Configure commission rates
- [ ] Configure tax rates
- [ ] View P&L statements
- [ ] Generate finance reports
- [ ] Generate AI insights

### 6. Business Unit Head Features
- [ ] View BU performance metrics
- [ ] View BU financial metrics
- [ ] View P&L for their BU
- [ ] View team performance in BU
- [ ] Generate BU reports
- [ ] Generate AI insights

### 7. CEO Features
- [ ] View organization overview
- [ ] View all business units
- [ ] Compare BU performance
- [ ] View organization P&L
- [ ] Generate AI insights

### 8. Admin Features
- [ ] View all organizations
- [ ] Monitor CEOs
- [ ] View cross-org metrics

### 9. AI Insights
- [ ] Generate insights for Team Leader
- [ ] Generate insights for Sales Manager
- [ ] Generate insights for Finance
- [ ] Generate insights for BU Head
- [ ] Generate insights for CEO
- [ ] View insight history
- [ ] Handle API errors gracefully

### 10. Reports
- [ ] Generate agent reports (daily/weekly/monthly/quarterly/yearly)
- [ ] Generate team reports
- [ ] Generate BU reports
- [ ] Export reports (JSON)
- [ ] Filter reports by date range
- [ ] Role-based report access control

### 11. Data Integrity
- [ ] Deals are linked to correct agents
- [ ] Teams are linked to correct BUs
- [ ] RLS policies enforce data access
- [ ] Organization isolation works
- [ ] Audit trails are created

## Test Execution Order

1. **Authentication & Setup** (5 min)
2. **Sales Agent Features** (15 min)
3. **Team Leader Features** (15 min)
4. **Sales Manager Features** (10 min)
5. **Finance Features** (15 min)
6. **BU Head Features** (10 min)
7. **CEO Features** (10 min)
8. **Admin Features** (5 min)
9. **AI Insights** (10 min)
10. **Reports** (10 min)
11. **Data Integrity** (10 min)

**Total Estimated Time: 1.5-2 hours**

## Test Data Requirements

### Required Test Data
- At least 2 organizations
- At least 2 business units per organization
- At least 2 teams per BU
- At least 3 agents per team
- At least 10 deals (various stages)
- At least 5 leads
- At least 3 client requests
- At least 5 meetings
- At least 3 attendance logs
- At least 5 daily metrics entries
- At least 3 agent ratings
- At least 5 cost entries
- At least 3 salary entries
- Commission and tax configurations

## Success Criteria

### Must Pass
- ✅ All authentication flows work
- ✅ All role-based access controls work
- ✅ All CRUD operations work
- ✅ All reports generate correctly
- ✅ AI insights generate (if API key is set)
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ No build errors

### Nice to Have
- ✅ Smooth animations
- ✅ Responsive design works on mobile
- ✅ Loading states are shown
- ✅ Error messages are user-friendly

## Known Issues to Watch For

1. **TypeScript Type Inference**: Some Supabase queries may need explicit type casting
2. **RLS Policies**: Ensure data isolation between organizations
3. **OpenAI API**: May have rate limits or timeout issues
4. **Date Filtering**: Reports use month-based grouping, custom date ranges may need adjustment
5. **Build Warnings**: Dynamic server usage warnings are expected for authenticated routes

## Test Execution

Run tests in the order listed above, documenting any issues found.

---

## Test Results

### Date: [To be filled]
### Tester: [To be filled]
### Environment: Development / Production

### Passed: [ ]
### Failed: [ ]
### Issues Found: [ ]

