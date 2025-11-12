# API Endpoints Test Guide

## Overview
This document lists all API endpoints and how to test them.

## Authentication Endpoints

### POST /api/auth/callback
- **Purpose**: Handle OAuth callback
- **Test**: Sign in via Supabase Auth UI
- **Expected**: Redirects to role-specific dashboard

## Deal Endpoints

### GET /api/deals
- **Purpose**: List deals for authenticated user
- **Test**: `curl http://localhost:3000/api/deals -H "Cookie: ..."`
- **Expected**: Returns deals for current user's organization

### POST /api/deals
- **Purpose**: Create new deal
- **Test**: 
```bash
curl -X POST http://localhost:3000/api/deals \
  -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{
    "name": "Test Deal",
    "dealValue": 100000,
    "stage": "prospecting",
    "sourceId": "...",
    "probability": 25
  }'
```
- **Expected**: Returns created deal

### PATCH /api/deals/[id]
- **Purpose**: Update deal
- **Test**: Update deal stage, value, etc.
- **Expected**: Returns updated deal

### DELETE /api/deals/[id]
- **Purpose**: Delete deal
- **Test**: Delete a deal
- **Expected**: Deal is deleted

### POST /api/deals/[id]/activities
- **Purpose**: Log deal activity
- **Test**: Add activity to deal
- **Expected**: Activity is logged

## Attendance Endpoints

### POST /api/attendance/check-in
- **Purpose**: Check in agent
- **Test**: Check in from agent dashboard
- **Expected**: Check-in time is recorded

### POST /api/attendance/check-out
- **Purpose**: Check out agent
- **Test**: Check out from agent dashboard
- **Expected**: Check-out time is recorded

### GET /api/attendance/today
- **Purpose**: Get today's attendance status
- **Test**: View attendance widget
- **Expected**: Returns today's attendance status

## Metrics Endpoints

### GET /api/metrics
- **Purpose**: Get daily metrics
- **Test**: View metrics panel
- **Expected**: Returns today's metrics

### POST /api/metrics
- **Purpose**: Update daily metrics
- **Test**: Update metrics from agent dashboard
- **Expected**: Metrics are updated

## Request Endpoints

### GET /api/requests
- **Purpose**: List client requests
- **Test**: View requests list
- **Expected**: Returns requests for team/organization

### POST /api/requests
- **Purpose**: Create client request
- **Test**: Submit request from agent dashboard
- **Expected**: Request is created

### PATCH /api/requests/[id]
- **Purpose**: Approve/reject request
- **Test**: Approve/reject from team leader dashboard
- **Expected**: Request status is updated

### POST /api/requests/[id]/convert
- **Purpose**: Convert request to deal
- **Test**: Convert request to deal
- **Expected**: Deal is created from request

## Meeting Endpoints

### GET /api/meetings
- **Purpose**: List meetings
- **Test**: View meetings calendar
- **Expected**: Returns upcoming meetings

### POST /api/meetings
- **Purpose**: Schedule meeting
- **Test**: Schedule meeting from agent dashboard
- **Expected**: Meeting is scheduled

### PATCH /api/meetings/[id]
- **Purpose**: Update meeting
- **Test**: Update meeting details
- **Expected**: Meeting is updated

### DELETE /api/meetings/[id]
- **Purpose**: Cancel meeting
- **Test**: Cancel meeting
- **Expected**: Meeting is cancelled

## Lead Endpoints

### GET /api/leads
- **Purpose**: List leads
- **Test**: View leads list
- **Expected**: Returns leads for organization

### POST /api/leads
- **Purpose**: Create lead
- **Test**: Create lead from agent dashboard
- **Expected**: Lead is created

### PATCH /api/leads/[id]
- **Purpose**: Update lead status
- **Test**: Update lead status
- **Expected**: Lead status is updated

### POST /api/leads/[id]/convert
- **Purpose**: Convert lead to deal
- **Test**: Convert lead to deal
- **Expected**: Deal is created from lead

## Rating Endpoints

### GET /api/ratings
- **Purpose**: Get agent ratings
- **Test**: View ratings from team leader dashboard
- **Expected**: Returns agent ratings

### POST /api/ratings
- **Purpose**: Submit agent rating
- **Test**: Submit rating from team leader dashboard
- **Expected**: Rating is saved

## Team Endpoints

### GET /api/teams
- **Purpose**: List teams
- **Test**: View teams from manager dashboard
- **Expected**: Returns teams for organization

### POST /api/teams
- **Purpose**: Create team
- **Test**: Create team from admin dashboard
- **Expected**: Team is created

### PATCH /api/teams/[id]
- **Purpose**: Update team
- **Test**: Update team details
- **Expected**: Team is updated

### POST /api/teams/[id]/members
- **Purpose**: Add team member
- **Test**: Add member from team leader dashboard
- **Expected**: Member is added to team

### DELETE /api/teams/[id]/members
- **Purpose**: Remove team member
- **Test**: Remove member from team leader dashboard
- **Expected**: Member is removed from team

## Supervision Endpoints

### GET /api/supervision
- **Purpose**: Get agent supervision status
- **Test**: View supervision panel
- **Expected**: Returns supervision status

### POST /api/supervision
- **Purpose**: Update supervision status
- **Test**: Toggle supervision from team leader dashboard
- **Expected**: Supervision status is updated

## Finance Endpoints

### GET /api/finance/costs
- **Purpose**: List costs
- **Test**: View costs from finance dashboard
- **Expected**: Returns costs for organization

### POST /api/finance/costs
- **Purpose**: Add cost
- **Test**: Add cost from finance dashboard
- **Expected**: Cost is added

### GET /api/finance/salaries
- **Purpose**: List salaries
- **Test**: View salaries from finance dashboard
- **Expected**: Returns salaries for organization

### POST /api/finance/salaries
- **Purpose**: Set salary
- **Test**: Set salary from finance dashboard
- **Expected**: Salary is set

### GET /api/finance/commissions
- **Purpose**: Get commission configuration
- **Test**: View commission config from finance dashboard
- **Expected**: Returns commission configuration

### POST /api/finance/commissions
- **Purpose**: Configure commission rates
- **Test**: Update commission rates from finance dashboard
- **Expected**: Commission rates are updated

### GET /api/finance/taxes
- **Purpose**: Get tax configuration
- **Test**: View tax config from finance dashboard
- **Expected**: Returns tax configuration

### POST /api/finance/taxes
- **Purpose**: Configure tax rates
- **Test**: Update tax rates from finance dashboard
- **Expected**: Tax rates are updated

### GET /api/finance/pnl
- **Purpose**: Get P&L statement
- **Test**: View P&L from finance dashboard
- **Expected**: Returns P&L statement

## Report Endpoints

### GET /api/reports/agent
- **Purpose**: Get agent performance report
- **Test**: Generate agent report
- **Expected**: Returns agent performance report

### GET /api/reports/team
- **Purpose**: Get team performance report
- **Test**: Generate team report
- **Expected**: Returns team performance report

### GET /api/reports/business-unit
- **Purpose**: Get BU performance report
- **Test**: Generate BU report
- **Expected**: Returns BU performance report

## AI Endpoints

### GET /api/ai/insights
- **Purpose**: Get recent AI insights
- **Test**: View insights panel
- **Expected**: Returns recent insights

### POST /api/ai/insights
- **Purpose**: Generate AI insight
- **Test**: Generate insight from dashboard
- **Expected**: Returns generated insight

## Admin Endpoints

### POST /api/admin/invite
- **Purpose**: Invite new user
- **Test**: Invite user from admin dashboard
- **Expected**: User is invited

## Deal Sources Endpoint

### GET /api/deal-sources
- **Purpose**: Get deal sources
- **Test**: View deal sources in deal form
- **Expected**: Returns deal sources for organization

## Testing Tools

### curl Examples
```bash
# Get deals (requires auth cookie)
curl http://localhost:3000/api/deals \
  -H "Cookie: sb-...-auth-token=..."

# Create deal (requires auth cookie)
curl -X POST http://localhost:3000/api/deals \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-...-auth-token=..." \
  -d '{
    "name": "Test Deal",
    "dealValue": 100000,
    "stage": "prospecting",
    "probability": 25
  }'
```

### Browser DevTools
- Open Network tab
- Filter by "api"
- Monitor API calls
- Check request/response payloads
- Verify status codes

## Expected Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error
- **503**: Service Unavailable (e.g., OpenAI API not configured)

## Common Issues

1. **401 Unauthorized**: User not authenticated or session expired
2. **403 Forbidden**: User doesn't have permission for this action
3. **500 Internal Server Error**: Check server logs for details
4. **503 Service Unavailable**: External service (e.g., OpenAI) not available

## Test Coverage

- [ ] All endpoints return expected status codes
- [ ] All endpoints validate input correctly
- [ ] All endpoints enforce authentication
- [ ] All endpoints enforce authorization (role-based)
- [ ] All endpoints handle errors gracefully
- [ ] All endpoints return proper error messages
- [ ] All endpoints log activities correctly
- [ ] All endpoints respect RLS policies

