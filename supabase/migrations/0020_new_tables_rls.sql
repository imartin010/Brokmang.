-- RLS Policies for new tables
-- Enable RLS on all new tables and create policies based on user roles

-- ============================================
-- ATTENDANCE LOGS RLS
-- ============================================

alter table public.attendance_logs enable row level security;

-- Agents can see their own attendance
create policy "Agents can view their own attendance"
on public.attendance_logs
for select
using (
  auth.uid() = agent_id
);

-- Agents can insert their own attendance
create policy "Agents can insert their own attendance"
on public.attendance_logs
for insert
with check (
  auth.uid() = agent_id
);

-- Agents can update their own attendance
create policy "Agents can update their own attendance"
on public.attendance_logs
for update
using (
  auth.uid() = agent_id
);

-- Team leaders can see their team's attendance
create policy "Team leaders can view team attendance"
on public.attendance_logs
for select
using (
  exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = attendance_logs.agent_id
  )
);

-- Sales managers and above can see all attendance in organization
create policy "Managers can view all attendance"
on public.attendance_logs
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = attendance_logs.organization_id
    and p.role in ('sales_manager', 'business_unit_head', 'ceo', 'admin')
  )
);

-- ============================================
-- CLIENT REQUESTS RLS
-- ============================================

alter table public.client_requests enable row level security;

-- Agents can see and create their own requests
create policy "Agents can view their own requests"
on public.client_requests
for select
using (
  auth.uid() = agent_id
);

create policy "Agents can create their own requests"
on public.client_requests
for insert
with check (
  auth.uid() = agent_id
);

-- Team leaders can see their team's requests
create policy "Team leaders can view team requests"
on public.client_requests
for select
using (
  team_leader_id = auth.uid()
  or exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = client_requests.agent_id
  )
);

-- Team leaders can update their team's requests
create policy "Team leaders can update team requests"
on public.client_requests
for update
using (
  team_leader_id = auth.uid()
);

-- Sales managers and above can see all requests in organization
create policy "Managers can view all requests"
on public.client_requests
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = client_requests.organization_id
    and p.role in ('sales_manager', 'business_unit_head', 'ceo', 'admin')
  )
);

-- ============================================
-- DAILY AGENT METRICS RLS
-- ============================================

alter table public.daily_agent_metrics enable row level security;

-- Agents can see and update their own metrics
create policy "Agents can view their own metrics"
on public.daily_agent_metrics
for select
using (
  auth.uid() = agent_id
);

create policy "Agents can insert their own metrics"
on public.daily_agent_metrics
for insert
with check (
  auth.uid() = agent_id
);

create policy "Agents can update their own metrics"
on public.daily_agent_metrics
for update
using (
  auth.uid() = agent_id
);

-- Team leaders can see their team's metrics
create policy "Team leaders can view team metrics"
on public.daily_agent_metrics
for select
using (
  exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = daily_agent_metrics.agent_id
  )
);

-- Sales managers and above can see all metrics in organization
create policy "Managers can view all metrics"
on public.daily_agent_metrics
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = daily_agent_metrics.organization_id
    and p.role in ('sales_manager', 'business_unit_head', 'ceo', 'admin')
  )
);

-- ============================================
-- MEETINGS RLS
-- ============================================

alter table public.meetings enable row level security;

-- Agents can see and manage their own meetings
create policy "Agents can view their own meetings"
on public.meetings
for select
using (
  auth.uid() = agent_id
);

create policy "Agents can create their own meetings"
on public.meetings
for insert
with check (
  auth.uid() = agent_id
);

create policy "Agents can update their own meetings"
on public.meetings
for update
using (
  auth.uid() = agent_id
);

create policy "Agents can delete their own meetings"
on public.meetings
for delete
using (
  auth.uid() = agent_id
);

-- Team leaders can see their team's meetings
create policy "Team leaders can view team meetings"
on public.meetings
for select
using (
  exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = meetings.agent_id
  )
);

-- Sales managers and above can see all meetings in organization
create policy "Managers can view all meetings"
on public.meetings
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = meetings.organization_id
    and p.role in ('sales_manager', 'business_unit_head', 'ceo', 'admin')
  )
);

-- ============================================
-- AGENT DAILY RATINGS RLS
-- ============================================

alter table public.agent_daily_ratings enable row level security;

-- Team leaders can create ratings for their team members
create policy "Team leaders can create ratings"
on public.agent_daily_ratings
for insert
with check (
  exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = agent_daily_ratings.agent_id
  )
  and rated_by = auth.uid()
);

-- Team leaders can view ratings for their team members
create policy "Team leaders can view team ratings"
on public.agent_daily_ratings
for select
using (
  exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = agent_daily_ratings.agent_id
  )
  or rated_by = auth.uid()
);

-- Sales managers and above can see all ratings in organization
create policy "Managers can view all ratings"
on public.agent_daily_ratings
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = agent_daily_ratings.organization_id
    and p.role in ('sales_manager', 'business_unit_head', 'ceo', 'admin')
  )
);

-- Note: Agents CANNOT see their own ratings (as per requirements)

-- ============================================
-- LEADS RLS
-- ============================================

alter table public.leads enable row level security;

-- Agents can see and manage their own leads
create policy "Agents can view their own leads"
on public.leads
for select
using (
  auth.uid() = agent_id
);

create policy "Agents can create their own leads"
on public.leads
for insert
with check (
  auth.uid() = agent_id
);

create policy "Agents can update their own leads"
on public.leads
for update
using (
  auth.uid() = agent_id
);

-- Team leaders can see their team's leads
create policy "Team leaders can view team leads"
on public.leads
for select
using (
  exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = leads.agent_id
  )
);

-- Sales managers and above can see all leads in organization
create policy "Managers can view all leads"
on public.leads
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = leads.organization_id
    and p.role in ('sales_manager', 'business_unit_head', 'ceo', 'admin')
  )
);

-- ============================================
-- COST ENTRIES RLS
-- ============================================

alter table public.cost_entries enable row level security;

-- Finance and above can manage all costs
create policy "Finance can manage all costs"
on public.cost_entries
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = cost_entries.organization_id
    and p.role in ('finance', 'ceo', 'admin')
  )
);

-- BU heads can view their BU's costs
create policy "BU heads can view their BU costs"
on public.cost_entries
for select
using (
  exists (
    select 1 from public.profiles p
    join public.business_units bu on bu.id = cost_entries.business_unit_id
    where p.id = auth.uid()
    and p.organization_id = cost_entries.organization_id
    and p.business_unit_id = bu.id
    and p.role = 'business_unit_head'
  )
);

-- ============================================
-- EMPLOYEE SALARIES RLS
-- ============================================

alter table public.employee_salaries enable row level security;

-- Finance and above can manage all salaries
create policy "Finance can manage all salaries"
on public.employee_salaries
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = employee_salaries.organization_id
    and p.role in ('finance', 'ceo', 'admin')
  )
);

-- Employees can view their own salary
create policy "Employees can view their own salary"
on public.employee_salaries
for select
using (
  auth.uid() = employee_id
);

-- ============================================
-- COMMISSION CONFIG RLS
-- ============================================

alter table public.commission_config enable row level security;

-- Finance and above can manage commission config
create policy "Finance can manage commission config"
on public.commission_config
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = commission_config.organization_id
    and p.role in ('finance', 'ceo', 'admin')
  )
);

-- All authenticated users can view commission config for their organization
create policy "Users can view commission config"
on public.commission_config
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = commission_config.organization_id
  )
);

-- ============================================
-- TAX CONFIG RLS
-- ============================================

alter table public.tax_config enable row level security;

-- Finance and above can manage tax config
create policy "Finance can manage tax config"
on public.tax_config
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = tax_config.organization_id
    and p.role in ('finance', 'ceo', 'admin')
  )
);

-- All authenticated users can view tax config for their organization
create policy "Users can view tax config"
on public.tax_config
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = tax_config.organization_id
  )
);

-- ============================================
-- DEVELOPER COMMISSION RATES RLS
-- ============================================

alter table public.developer_commission_rates enable row level security;

-- Finance and above can manage developer commission rates
create policy "Finance can manage developer commission rates"
on public.developer_commission_rates
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = developer_commission_rates.organization_id
    and p.role in ('finance', 'ceo', 'admin')
  )
);

-- All authenticated users can view developer commission rates for their organization
create policy "Users can view developer commission rates"
on public.developer_commission_rates
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.organization_id = developer_commission_rates.organization_id
  )
);

-- ============================================
-- VIEWS RLS (inherit from base tables)
-- ============================================

-- Views automatically inherit RLS from their base tables
-- No additional policies needed for views

comment on policy "Agents can view their own attendance" on public.attendance_logs is 'RLS policy: Agents can view their own attendance records.';
comment on policy "Team leaders can view team attendance" on public.attendance_logs is 'RLS policy: Team leaders can view attendance for their team members.';
comment on policy "Finance can manage all costs" on public.cost_entries is 'RLS policy: Finance role can manage all cost entries.';

