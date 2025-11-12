# Testing Checklist - Quick Reference

## Quick Test Flow

### 1. Authentication ✅
- [ ] Sign in with test user
- [ ] Verify redirect to correct dashboard
- [ ] Sign out works

### 2. Sales Agent Dashboard ✅
- [ ] Check-in works
- [ ] Check-out works
- [ ] Daily metrics can be updated
- [ ] Can create deal with source
- [ ] Can create lead
- [ ] Can submit client request
- [ ] Can schedule meeting
- [ ] Deals table displays correctly
- [ ] Recent activity shows up
- [ ] Agent report generates

### 3. Team Leader Dashboard ✅
- [ ] Team stats display
- [ ] Can view pending requests
- [ ] Can approve/reject requests
- [ ] Can manage supervision
- [ ] Can submit agent ratings
- [ ] Can add/remove team members
- [ ] Team performance cards show
- [ ] Member performance shows
- [ ] Team report generates
- [ ] Agent report generates
- [ ] AI insights generate

### 4. Sales Manager Dashboard ✅
- [ ] Multi-team view displays
- [ ] Team comparison works
- [ ] Agent performance across teams shows
- [ ] Reports generate
- [ ] AI insights generate

### 5. Finance Dashboard ✅
- [ ] Can enter fixed costs
- [ ] Can enter variable costs
- [ ] Can manage salaries
- [ ] Can configure commissions
- [ ] Can configure taxes
- [ ] P&L statement displays
- [ ] Finance trends show
- [ ] AI insights generate

### 6. Business Unit Head Dashboard ✅
- [ ] BU performance metrics show
- [ ] BU financial metrics show
- [ ] P&L for BU displays
- [ ] Team performance in BU shows
- [ ] BU report generates
- [ ] AI insights generate

### 7. CEO Dashboard ✅
- [ ] Organization overview displays
- [ ] All BUs show
- [ ] BU comparison works
- [ ] Organization P&L shows
- [ ] AI insights generate

### 8. Admin Dashboard ✅
- [ ] Organization list shows
- [ ] Can view org metrics
- [ ] Cross-org data displays

## Critical Path Tests

### Must Work for Launch
1. ✅ User can sign in
2. ✅ Agent can check in/out
3. ✅ Agent can create deals
4. ✅ Team leader can approve requests
5. ✅ Finance can enter costs
6. ✅ Reports generate
7. ✅ AI insights work (if API key set)
8. ✅ Data is isolated by organization
9. ✅ RLS policies enforce access control

## Test Data Setup

Before testing, ensure you have:
- Test users for each role
- At least one organization
- At least one business unit
- At least one team
- At least one agent
- Some sample deals
- Some sample leads
- Some sample requests

## Quick Test Script

```bash
# 1. Start dev server
npm run dev

# 2. Sign in as each role and test:
# - Sales Agent: /app/agent
# - Team Leader: /app/leader
# - Sales Manager: /app/manager
# - Finance: /app/finance
# - BU Head: /app/business-unit
# - CEO: /app/executive
# - Admin: /app/admin

# 3. Test each feature:
# - Check-in/out
# - Create deal
# - Create lead
# - Submit request
# - Approve request
# - Generate report
# - Generate AI insight
```

## Common Issues to Check

1. **Type Errors**: Check browser console for TypeScript errors
2. **API Errors**: Check network tab for failed API calls
3. **RLS Errors**: Check for "permission denied" errors
4. **Missing Data**: Check if views return empty results
5. **Date Issues**: Check if date filters work correctly
6. **OpenAI Errors**: Check if API key is set and valid

