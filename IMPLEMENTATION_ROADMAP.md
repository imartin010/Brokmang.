# Brokmang Platform - Complete Implementation Roadmap

**Goal**: Build all missing features and launch production-ready platform  
**Timeline**: 2-3 days (16-24 hours of work)  
**Start Date**: November 11, 2025

---

## 📅 DAY 1: AGENT & TEAM LEADER CORE FEATURES (8-10 hours)

### Phase 1: Fix Current Issues (1 hour)
- [ ] Restart dev server and verify all existing features work
- [ ] Test authentication and CEO dashboard
- [ ] Fix any immediate bugs

### Phase 2: Agent Daily Routine System (4 hours)

#### 2.1 Check-In/Check-Out System (1.5 hours)
**Database Migration** (`0010_attendance_system.sql`):
```sql
CREATE TABLE public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  agent_id UUID NOT NULL REFERENCES profiles(id),
  check_in_time TIMESTAMPTZ NOT NULL,
  check_out_time TIMESTAMPTZ,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  location_check_in TEXT,
  location_check_out TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, work_date)
);
```

**API Endpoints**:
- `POST /api/attendance/check-in` - Record check-in
- `POST /api/attendance/check-out` - Record check-out
- `GET /api/attendance/today` - Get today's attendance

**UI Components**:
- Check-in/out buttons on agent dashboard
- Display current status (checked in/out)
- Show today's hours worked

#### 2.2 Phone Calls Tracking (1 hour)
**Database**: Add to `activity_log` or create `daily_metrics` table
```sql
CREATE TABLE public.daily_agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES profiles(id),
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_calls_count INT DEFAULT 0,
  meetings_scheduled INT DEFAULT 0,
  requests_generated INT DEFAULT 0,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (agent_id, work_date)
);
```

**UI**: Add call counter widget to agent dashboard

#### 2.3 Client Request System (1.5 hours)
**Database Migration** (`0011_client_requests.sql`):
```sql
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'converted');

CREATE TABLE public.client_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  agent_id UUID NOT NULL REFERENCES profiles(id),
  team_leader_id UUID REFERENCES profiles(id),
  status request_status DEFAULT 'pending',
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  destination TEXT NOT NULL,
  client_budget NUMERIC(14,2) NOT NULL,
  project_needed TEXT NOT NULL,
  delivery_date DATE,
  notes TEXT,
  leader_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  converted_deal_id UUID REFERENCES deals(id)
);
```

**API**: `POST /api/requests`, `GET /api/requests`, `PATCH /api/requests/[id]`

**UI**:
- Request submission form for agents
- Request approval interface for team leaders

### Phase 3: Deal Sources & Enhancements (1 hour)

#### 3.1 Deal Source Integration
**Update Deal Creation Form**:
- Add source dropdown (lead, cold call, company data, personal data, referral)
- Seed `deal_sources` table with standard sources
- Link deals to sources on creation

**API Update**: Modify `POST /api/deals` to accept `source_id`

### Phase 4: Team Leader Monitoring Tools (2.5 hours)

#### 4.1 Agent Supervision Mode (1 hour)
**Database**:
```sql
ALTER TABLE public.profiles ADD COLUMN under_supervision BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN supervised_by UUID REFERENCES profiles(id);
ALTER TABLE public.profiles ADD COLUMN supervision_started_at TIMESTAMPTZ;
```

**UI**: Toggle switch on team leader dashboard to enable/disable supervision

#### 4.2 Agent Rating System (1.5 hours)
**Database** (`0012_agent_ratings.sql`):
```sql
CREATE TABLE public.agent_daily_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  agent_id UUID NOT NULL REFERENCES profiles(id),
  rated_by UUID NOT NULL REFERENCES profiles(id),
  rating_date DATE NOT NULL DEFAULT CURRENT_DATE,
  appearance_score INT CHECK (appearance_score BETWEEN 1 AND 10),
  professionalism_score INT CHECK (professionalism_score BETWEEN 1 AND 10),
  honesty_score INT CHECK (honesty_score BETWEEN 1 AND 10),
  kindness_score INT CHECK (kindness_score BETWEEN 1 AND 10),
  leads_received_count INT DEFAULT 0,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (agent_id, rating_date, rated_by)
);
```

**UI**: Rating form on team leader dashboard

---

## 📅 DAY 2: FINANCE & REPORTING FEATURES (8 hours)

### Phase 5: Finance Cost Management System (4 hours)

#### 5.1 Cost Categories & Entry (2 hours)
**Database** (`0013_finance_detailed_costs.sql`):
```sql
CREATE TYPE public.cost_category AS ENUM (
  'rent', 'salary_agent', 'salary_team_leader', 
  'salary_sales_manager', 'salary_bu_head',
  'marketing', 'phone_bills', 'other_fixed', 'other_variable'
);

CREATE TABLE public.cost_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  business_unit_id UUID REFERENCES business_units(id),
  category cost_category NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  cost_month DATE NOT NULL,
  description TEXT,
  is_fixed_cost BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.employee_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  monthly_salary NUMERIC(14,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_id, effective_from)
);
```

**API**:
- `POST /api/finance/costs` - Add cost entry
- `GET /api/finance/costs` - List costs
- `POST /api/finance/salaries` - Set salary
- `GET /api/finance/salaries` - List salaries

**UI**: Finance cost entry forms with category selection

#### 5.2 Commission & Tax Calculator (2 hours)
**Database** (`0014_commission_tax_config.sql`):
```sql
CREATE TABLE public.commission_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  role user_role NOT NULL,
  base_rate NUMERIC(10,6) NOT NULL, -- e.g., 0.006 for 6000/1M
  per_million NUMERIC(14,2) DEFAULT 1000000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, role)
);

CREATE TABLE public.tax_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  withholding_tax_rate NUMERIC(5,4) DEFAULT 0.05, -- 5%
  vat_rate NUMERIC(5,4) DEFAULT 0.14, -- 14%
  income_tax_rate NUMERIC(5,4) DEFAULT 0, -- Variable
  effective_from DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.developer_commission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  developer_name TEXT NOT NULL,
  commission_rate NUMERIC(5,4) NOT NULL, -- e.g., 0.02 for 2%
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Functions**: Create calculation functions for auto-computing commissions and taxes

**UI**: 
- Tax configuration form for finance
- Commission rate settings
- Auto-calculate and display on finance dashboard

### Phase 6: Leads & Conversion Tracking (2 hours)

**Database** (`0015_leads_system.sql`):
```sql
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost');

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  agent_id UUID NOT NULL REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  source_id UUID REFERENCES deal_sources(id),
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  status lead_status DEFAULT 'new',
  converted_deal_id UUID REFERENCES deals(id),
  received_date DATE DEFAULT CURRENT_DATE,
  converted_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add lead tracking to daily ratings
ALTER TABLE agent_daily_ratings 
  ADD COLUMN deals_closed_count INT DEFAULT 0;
```

**UI**: Lead entry form, lead list, conversion tracking dashboard

### Phase 7: Custom Reports (2 hours)

**Create Report Views**:
```sql
CREATE VIEW agent_performance_report AS ...;
CREATE VIEW team_performance_report AS ...;
CREATE VIEW finance_pnl_report AS ...;
```

**API**: `GET /api/reports/:type?period=daily|weekly|monthly|quarterly|yearly`

**UI**: Report generator with date range picker and export to PDF/Excel

---

## 📅 DAY 3: ADVANCED FEATURES & POLISH (6-8 hours)

### Phase 8: AI Insights Integration (3 hours)

#### 8.1 OpenAI Integration
**Create Edge Function** (`/api/ai/generate`):
```typescript
// Use OpenAI GPT-4 to analyze data and generate insights
// Role-specific prompts for Team Leader, Manager, Finance, BU Head, CEO
```

**Prompts by Role**:
- Team Leader: Agent performance analysis, coaching recommendations
- Sales Manager: Team comparison, resource allocation suggestions
- Finance: Cost optimization, revenue forecasting
- BU Head: Business unit health, strategic recommendations
- CEO: Executive summary, cross-BU insights

**UI**: 
- "Get AI Insights" button on each dashboard
- Display insights in modal/section
- Save insights history

### Phase 9: Admin Multi-Org Dashboard (2 hours)

**Database**: Already supports multiple orgs

**UI** (`/app/admin/page.tsx`):
- List all organizations
- View CEO performance across orgs
- Organization comparison metrics
- Quick access to any organization's data

### Phase 10: Enhanced Team Leader Tools (2 hours)

#### 10.1 Team Management Interface
**UI Components**:
- Add agent to team form
- Remove agent from team
- Transfer agent between teams
- View team member list with management actions

**API**: 
- `POST /api/teams/[id]/members` - Add member
- `DELETE /api/teams/[id]/members/[userId]` - Remove member

#### 10.2 Detailed Agent View
**UI**: Drill-down page showing:
- Agent profile
- Complete daily routine history
- All ratings over time
- Lead conversion stats
- Performance trends

### Phase 11: Sales Manager Enhancements (1 hour)

**UI** (`/app/manager/page.tsx`):
- Multi-team overview grid
- Cross-team agent comparison
- Resource allocation view
- Team leader performance tracking

---

## 🔧 TECHNICAL IMPLEMENTATION ORDER

### Day 1 - Session 1 (Morning: 4 hours)
1. ✅ Fix dev server
2. Create attendance system (check-in/out)
3. Implement client request system
4. Add deal source selection

### Day 1 - Session 2 (Afternoon: 4-6 hours)
5. Build phone call & mood tracking
6. Create meeting/calendar system
7. Implement agent supervision mode
8. Build agent rating system

### Day 2 - Session 1 (Morning: 4 hours)
9. Build finance cost entry system
10. Implement salary management
11. Create commission calculator
12. Build tax calculation system

### Day 2 - Session 2 (Afternoon: 4 hours)
13. Create P&L statement views
14. Build lead tracking system
15. Implement report generation
16. Add team management UI

### Day 3 - Session 1 (Morning: 3 hours)
17. Integrate OpenAI for AI insights
18. Build admin dashboard
19. Create sales manager dedicated view

### Day 3 - Session 2 (Afternoon: 3-5 hours)
20. End-to-end testing all features
21. Fix bugs and polish UI
22. Create user documentation
23. Deploy to production
24. Final production testing

---

## 📋 IMPLEMENTATION CHECKLIST

### Foundation (Already Complete ✅)
- [x] Database with 9 migrations
- [x] Authentication system
- [x] Role-based routing
- [x] Basic dashboards for all roles
- [x] API infrastructure
- [x] TypeScript types
- [x] Production build working

### Day 1 Deliverables
- [ ] Agent can check-in and check-out
- [ ] Agent can submit client requests with full details
- [ ] Team leader can approve/reject requests
- [ ] Agent can track phone calls
- [ ] Agent can log mood
- [ ] Meeting scheduling system
- [ ] Deal sources fully integrated
- [ ] Agent supervision flags
- [ ] Daily agent rating system

### Day 2 Deliverables
- [ ] Finance can enter all cost types
- [ ] Salary management system
- [ ] Auto-calculated commissions by role
- [ ] Tax calculations (withholding, VAT, income tax)
- [ ] Full P&L statements per BU
- [ ] Lead tracking separate from deals
- [ ] Lead → Deal conversion tracking
- [ ] Custom report generation
- [ ] Team member add/remove functionality

### Day 3 Deliverables
- [ ] AI insights working with OpenAI
- [ ] Role-specific AI recommendations
- [ ] Admin dashboard for multi-org view
- [ ] Sales manager dedicated interface
- [ ] All features tested
- [ ] Production deployment
- [ ] User documentation

---

## 🗂️ FILE STRUCTURE FOR NEW FEATURES

```
supabase/migrations/
  0010_attendance_system.sql          # Check-in/out tables
  0011_client_requests.sql            # Request management
  0012_daily_metrics.sql              # Calls, mood tracking
  0013_agent_ratings.sql              # Rating system
  0014_finance_costs.sql              # Detailed cost tracking
  0015_commission_tax.sql             # Commission & tax config
  0016_leads_system.sql               # Lead tracking
  0017_reports_views.sql              # Report generation views

src/app/api/
  attendance/
    check-in/route.ts
    check-out/route.ts
    today/route.ts
  requests/
    route.ts                          # List/create requests
    [id]/route.ts                     # Update/approve requests
  finance/
    costs/route.ts
    salaries/route.ts
    commissions/route.ts
  leads/
    route.ts
    [id]/convert/route.ts
  teams/
    [id]/members/route.ts
  reports/
    [type]/route.ts
  ai/
    generate/route.ts                 # OpenAI integration

src/app/app/
  agent/
    attendance-widget.tsx
    request-form.tsx
    call-tracker.tsx
    mood-selector.tsx
  leader/
    agent-supervision.tsx
    rating-form.tsx
    request-approvals.tsx
    team-management.tsx
  finance/
    cost-entry-form.tsx
    salary-management.tsx
    pnl-statement.tsx
  manager/
    page.tsx                          # Dedicated manager view
  admin/
    page.tsx                          # Admin dashboard
    
src/components/
  reports/
    report-generator.tsx
    export-buttons.tsx
  ai/
    insights-panel.tsx
    generate-button.tsx
```

---

## 🎯 SUCCESS METRICS

Platform is complete when:

### Sales Agent
- ✅ Can check-in and check-out daily
- ✅ Can track phone calls count
- ✅ Can generate client requests with all fields
- ✅ Can schedule meetings
- ✅ Can close deals with source tracking
- ✅ Can log daily mood

### Team Leader
- ✅ Can view all agent daily routines
- ✅ Can approve/reject client requests
- ✅ Can put agents under supervision
- ✅ Can rate agents daily (appearance, behavior)
- ✅ Can track leads vs. deals conversion
- ✅ Can add/remove team members
- ✅ Can generate custom reports

### Sales Manager
- ✅ Can do everything team leader does
- ✅ Can view multiple teams at once
- ✅ Can compare teams side-by-side
- ✅ Can drill down to agent level across all teams

### Finance
- ✅ Can enter fixed costs (rent, salaries by role)
- ✅ Can enter variable costs (marketing, phone, other)
- ✅ Can see auto-calculated revenue from deals
- ✅ Can see commission cuts by role
- ✅ Can configure tax rates
- ✅ Can view net profit after all deductions
- ✅ Can audit BU head expenses

### Business Unit Head
- ✅ Can view performance metrics for their BU
- ✅ Can view financial metrics for their BU
- ✅ Can toggle self-financed mode
- ✅ Can enter own expenses if self-financed
- ✅ Can drill down to agent level in their BU

### CEO
- ✅ Can view all business units
- ✅ Can compare BU performance
- ✅ Can see P&L per BU
- ✅ Can drill down from BU → Agent level
- ✅ Can get AI insights on organization health

### Admin
- ✅ Can view all organizations
- ✅ Can monitor all CEOs
- ✅ Can see cross-org metrics

### AI (All except Agent)
- ✅ Get role-specific insights and recommendations
- ✅ View insight history

---

## 🚀 READY TO START?

**Next Step**: I'll begin implementing features in the order listed above, starting with fixing the dev server and then building the attendance system.

Shall I proceed with the implementation now?

