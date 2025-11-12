-- MASTER SCRIPT: Apply all new migrations for Brokmang platform
-- Run this in Supabase SQL Editor to add all missing features
-- Estimated time: 30 seconds

-- Step 1: Fix user role to CEO
UPDATE public.profiles 
SET role = 'ceo' 
WHERE id = '6fc8c806-51a2-4365-8ac5-85d82f007cc7';

-- ============================================
-- MIGRATION 0010: Attendance System
-- ============================================

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  check_in_time timestamptz not null,
  check_out_time timestamptz,
  work_date date not null default current_date,
  location_check_in text,
  location_check_out text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, work_date)
);

create index if not exists attendance_logs_agent_idx on public.attendance_logs (agent_id);
create index if not exists attendance_logs_date_idx on public.attendance_logs (work_date);
create index if not exists attendance_logs_org_idx on public.attendance_logs (organization_id);

drop trigger if exists attendance_logs_updated_at on public.attendance_logs;
create trigger attendance_logs_updated_at
before update on public.attendance_logs
for each row
execute procedure public.set_updated_at();

create or replace view public.attendance_today as
select
  al.id,
  al.agent_id,
  p.full_name as agent_name,
  p.email,
  al.check_in_time,
  al.check_out_time,
  al.work_date,
  case 
    when al.check_out_time is not null then extract(epoch from (al.check_out_time - al.check_in_time)) / 3600
    else null
  end as hours_worked,
  al.organization_id,
  al.location_check_in,
  al.location_check_out
from public.attendance_logs al
join public.profiles p on p.id = al.agent_id
where al.work_date = current_date;

-- ============================================
-- MIGRATION 0011: Client Requests
-- ============================================

do $$ begin
  create type public.request_status as enum ('pending', 'approved', 'rejected', 'converted');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  team_leader_id uuid references public.profiles(id) on delete set null,
  status public.request_status not null default 'pending',
  client_name text not null,
  client_phone text not null,
  destination text not null,
  client_budget numeric(14,2) not null,
  project_needed text not null,
  delivery_date date,
  agent_notes text,
  leader_notes text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  converted_deal_id uuid references public.deals(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists client_requests_agent_idx on public.client_requests (agent_id);
create index if not exists client_requests_status_idx on public.client_requests (status);
create index if not exists client_requests_team_leader_idx on public.client_requests (team_leader_id);
create index if not exists client_requests_org_idx on public.client_requests (organization_id);

drop trigger if exists client_requests_updated_at on public.client_requests;
create trigger client_requests_updated_at
before update on public.client_requests
for each row
execute procedure public.set_updated_at();

create or replace view public.pending_requests_by_leader as
select
  cr.id,
  cr.agent_id,
  p.full_name as agent_name,
  cr.team_leader_id,
  cr.client_name,
  cr.client_phone,
  cr.destination,
  cr.client_budget,
  cr.project_needed,
  cr.delivery_date,
  cr.agent_notes,
  cr.created_at,
  cr.organization_id
from public.client_requests cr
join public.profiles p on p.id = cr.agent_id
where cr.status = 'pending'
order by cr.created_at desc;

-- ============================================
-- MIGRATION 0012: Daily Agent Metrics
-- ============================================

create table if not exists public.daily_agent_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null default current_date,
  active_calls_count int not null default 0,
  leads_taken_count int not null default 0,
  cold_calls_count int not null default 0,
  meetings_scheduled int not null default 0,
  meetings_completed int not null default 0,
  requests_generated int not null default 0,
  deals_closed int not null default 0,
  orientation text check (orientation in ('team', 'developer')),
  mood text check (mood in ('great', 'good', 'okay', 'stressed', 'difficult')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, work_date)
);

create index if not exists daily_agent_metrics_agent_idx on public.daily_agent_metrics (agent_id);
create index if not exists daily_agent_metrics_date_idx on public.daily_agent_metrics (work_date);
create index if not exists daily_agent_metrics_org_idx on public.daily_agent_metrics (organization_id);

drop trigger if exists daily_agent_metrics_updated_at on public.daily_agent_metrics;
create trigger daily_agent_metrics_updated_at
before update on public.daily_agent_metrics
for each row
execute procedure public.set_updated_at();

create or replace view public.agent_daily_summary as
select
  dam.agent_id,
  p.full_name as agent_name,
  dam.work_date,
  coalesce(dam.active_calls_count, 0) as calls_made,
  coalesce(dam.leads_taken_count, 0) as leads_taken,
  coalesce(dam.cold_calls_count, 0) as cold_calls,
  coalesce(dam.meetings_scheduled, 0) as meetings,
  coalesce(dam.meetings_completed, 0) as meetings_completed,
  coalesce(dam.requests_generated, 0) as requests,
  coalesce(dam.deals_closed, 0) as deals,
  dam.orientation,
  dam.mood,
  al.check_in_time,
  al.check_out_time,
  case 
    when al.check_out_time is not null then 
      extract(epoch from (al.check_out_time - al.check_in_time)) / 3600
    else null
  end as hours_worked
from public.daily_agent_metrics dam
join public.profiles p on p.id = dam.agent_id
left join public.attendance_logs al on al.agent_id = dam.agent_id and al.work_date = dam.work_date
order by dam.work_date desc, p.full_name;

comment on column public.daily_agent_metrics.leads_taken_count is 'Number of leads claimed by the agent for the work date.';
comment on column public.daily_agent_metrics.cold_calls_count is 'Number of cold calls completed by the agent for the work date.';
comment on column public.daily_agent_metrics.meetings_completed is 'Number of meetings completed (logged) by the agent for the work date.';
comment on column public.daily_agent_metrics.orientation is 'Morning knowledge orientation selected by the agent for the work date.';

-- ============================================
-- MIGRATION 0013: Meetings Calendar
-- ============================================

do $$ begin
  create type public.meeting_status as enum ('scheduled', 'completed', 'cancelled', 'rescheduled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  client_request_id uuid references public.client_requests(id) on delete set null,
  title text not null,
  description text,
  meeting_date date not null,
  meeting_time time not null,
  duration_minutes int default 60,
  location text,
  attendees jsonb default '[]'::jsonb,
  status public.meeting_status not null default 'scheduled',
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meetings_agent_idx on public.meetings (agent_id);
create index if not exists meetings_date_idx on public.meetings (meeting_date);
create index if not exists meetings_status_idx on public.meetings (status);
create index if not exists meetings_org_idx on public.meetings (organization_id);

drop trigger if exists meetings_updated_at on public.meetings;
create trigger meetings_updated_at
before update on public.meetings
for each row
execute procedure public.set_updated_at();

create or replace view public.upcoming_meetings as
select
  m.id,
  m.agent_id,
  p.full_name as agent_name,
  m.title,
  m.meeting_date,
  m.meeting_time,
  (m.meeting_date || ' ' || m.meeting_time)::timestamptz as meeting_datetime,
  m.duration_minutes,
  m.location,
  m.status,
  m.deal_id,
  d.name as deal_name,
  m.client_request_id,
  m.organization_id
from public.meetings m
join public.profiles p on p.id = m.agent_id
left join public.deals d on d.id = m.deal_id
where m.status = 'scheduled' 
  and (m.meeting_date || ' ' || m.meeting_time)::timestamptz >= now()
order by m.meeting_date, m.meeting_time;

-- ============================================
-- MIGRATION 0014: Agent Ratings & Supervision
-- ============================================

create table if not exists public.agent_daily_ratings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  rated_by uuid not null references public.profiles(id) on delete cascade,
  rating_date date not null default current_date,
  appearance_score int check (appearance_score between 1 and 10),
  professionalism_score int check (professionalism_score between 1 and 10),
  honesty_score int check (honesty_score between 1 and 10),
  kindness_score int check (kindness_score between 1 and 10),
  leads_received_count int default 0,
  deals_closed_count int default 0,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, rating_date, rated_by)
);

create index if not exists agent_daily_ratings_agent_idx on public.agent_daily_ratings (agent_id);
create index if not exists agent_daily_ratings_date_idx on public.agent_daily_ratings (rating_date);
create index if not exists agent_daily_ratings_rater_idx on public.agent_daily_ratings (rated_by);
create index if not exists agent_daily_ratings_org_idx on public.agent_daily_ratings (organization_id);

drop trigger if exists agent_daily_ratings_updated_at on public.agent_daily_ratings;
create trigger agent_daily_ratings_updated_at
before update on public.agent_daily_ratings
for each row
execute procedure public.set_updated_at();

-- Add supervision columns to profiles
alter table public.profiles add column if not exists under_supervision boolean default false;
alter table public.profiles add column if not exists supervised_by uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists supervision_started_at timestamptz;

-- ============================================
-- MIGRATION 0015: Leads System
-- ============================================

do $$ begin
  create type public.lead_status as enum ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  source_id uuid references public.deal_sources(id) on delete set null,
  client_name text not null,
  client_phone text,
  client_email text,
  destination text,
  estimated_budget numeric(14,2),
  project_type text,
  status public.lead_status not null default 'new',
  converted_deal_id uuid references public.deals(id) on delete set null,
  received_date date not null default current_date,
  contacted_date date,
  qualified_date date,
  converted_date date,
  lost_date date,
  lost_reason text,
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_agent_idx on public.leads (agent_id);
create index if not exists leads_team_idx on public.leads (team_id);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_source_idx on public.leads (source_id);
create index if not exists leads_received_date_idx on public.leads (received_date);
create index if not exists leads_org_idx on public.leads (organization_id);

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
before update on public.leads
for each row
execute procedure public.set_updated_at();

-- ============================================
-- MIGRATION 0016: Finance Detailed Costs
-- ============================================

do $$ begin
  create type public.cost_category as enum (
    'rent', 'salary_agent', 'salary_team_leader', 'salary_sales_manager', 
    'salary_bu_head', 'salary_finance', 'salary_ceo', 'salary_admin',
    'marketing', 'phone_bills', 'utilities', 'software_subscriptions',
    'office_supplies', 'travel', 'training', 'other_fixed', 'other_variable'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.cost_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_unit_id uuid references public.business_units(id) on delete cascade,
  category public.cost_category not null,
  amount numeric(14,2) not null,
  cost_month date not null,
  description text,
  is_fixed_cost boolean not null default true,
  is_recurring boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approval_status text default 'approved' check (approval_status in ('pending', 'approved', 'rejected')),
  receipt_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cost_entries_bu_idx on public.cost_entries (business_unit_id);
create index if not exists cost_entries_month_idx on public.cost_entries (cost_month);
create index if not exists cost_entries_category_idx on public.cost_entries (category);
create index if not exists cost_entries_org_idx on public.cost_entries (organization_id);

drop trigger if exists cost_entries_updated_at on public.cost_entries;
create trigger cost_entries_updated_at
before update on public.cost_entries
for each row
execute procedure public.set_updated_at();

create table if not exists public.employee_salaries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.profiles(id) on delete cascade,
  monthly_salary numeric(14,2) not null,
  role public.user_role not null,
  effective_from date not null,
  effective_to date,
  currency text default 'EGP',
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, effective_from)
);

create index if not exists employee_salaries_employee_idx on public.employee_salaries (employee_id);
create index if not exists employee_salaries_effective_idx on public.employee_salaries (effective_from, effective_to);
create index if not exists employee_salaries_org_idx on public.employee_salaries (organization_id);

drop trigger if exists employee_salaries_updated_at on public.employee_salaries;
create trigger employee_salaries_updated_at
before update on public.employee_salaries
for each row
execute procedure public.set_updated_at();

-- ============================================
-- MIGRATION 0017: Commission & Tax Config
-- ============================================

create table if not exists public.commission_config (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role public.user_role not null,
  base_rate_per_million numeric(14,2) not null,
  description text,
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, role, effective_from)
);

create index if not exists commission_config_org_role_idx on public.commission_config (organization_id, role);

drop trigger if exists commission_config_updated_at on public.commission_config;
create trigger commission_config_updated_at
before update on public.commission_config
for each row
execute procedure public.set_updated_at();

create table if not exists public.developer_commission_rates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  developer_name text not null,
  project_name text,
  commission_percentage numeric(5,2) not null check (commission_percentage between 0 and 100),
  base_commission_amount numeric(14,2),
  notes text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists developer_commission_org_idx on public.developer_commission_rates (organization_id);
create index if not exists developer_commission_active_idx on public.developer_commission_rates (is_active);

drop trigger if exists developer_commission_rates_updated_at on public.developer_commission_rates;
create trigger developer_commission_rates_updated_at
before update on public.developer_commission_rates
for each row
execute procedure public.set_updated_at();

-- Add developer_id to deals if not exists
alter table public.deals add column if not exists developer_id uuid references public.developer_commission_rates(id) on delete set null;

create table if not exists public.tax_config (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  withholding_tax_rate numeric(5,4) not null default 0.05,
  vat_rate numeric(5,4) not null default 0.14,
  income_tax_rate numeric(5,4) not null default 0,
  effective_from date not null default current_date,
  effective_to date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, effective_from)
);

create index if not exists tax_config_org_idx on public.tax_config (organization_id);
create index if not exists tax_config_effective_idx on public.tax_config (effective_from, effective_to);

drop trigger if exists tax_config_updated_at on public.tax_config;
create trigger tax_config_updated_at
before update on public.tax_config
for each row
execute procedure public.set_updated_at();

-- ============================================
-- SEED DEFAULT CONFIGURATION
-- ============================================

-- Seed deal sources
insert into public.deal_sources (organization_id, name)
values 
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Lead'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Cold Call'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Company Data'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Personal Data'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Referral'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Website'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Social Media')
on conflict (organization_id, lower(name)) do nothing;

-- Seed commission configuration
insert into public.commission_config (organization_id, role, base_rate_per_million, description)
values
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'sales_agent', 6000, 'Average 6000 EGP per 1 Million in sales'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'team_leader', 2500, 'Average 2500 EGP per 1 Million in sales'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'sales_manager', 1500, 'Average 1500 EGP per 1 Million in sales'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'business_unit_head', 0, 'No direct sales commission'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'finance', 0, 'No sales commission'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'ceo', 0, 'No sales commission'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'admin', 0, 'No sales commission')
on conflict (organization_id, role, effective_from) do nothing;

-- Seed tax configuration
insert into public.tax_config (organization_id, withholding_tax_rate, vat_rate, income_tax_rate, notes)
values (
  '3664ed88-2563-4abf-81e3-3cf405dd7580',
  0.05,
  0.14,
  0.00,
  'Default tax rates for Egypt. Finance should update income tax rate as needed.'
)
on conflict (organization_id, effective_from) do nothing;

-- Seed developer commission rates
insert into public.developer_commission_rates (organization_id, developer_name, commission_percentage, notes)
values
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Default Developer', 2.0, 'Default 2% commission rate'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Premium Developer A', 2.5, 'Higher commission for premium projects'),
  ('3664ed88-2563-4abf-81e3-3cf405dd7580', 'Budget Developer B', 1.5, 'Lower commission for budget-friendly projects')
on conflict do nothing;

-- ============================================
-- MIGRATION 0018: P&L Statements
-- ============================================

-- Comprehensive P&L view per business unit
create or replace view public.business_unit_pnl as
select
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  bu.organization_id,
  fs.snapshot_month as period_month,
  -- Revenue
  coalesce(fs.revenue, 0)::numeric as gross_revenue,
  -- Expenses
  coalesce(fs.expenses, 0)::numeric as total_expenses,
  coalesce(sum(ce.amount) filter (where ce.is_fixed_cost = true), 0)::numeric as fixed_costs,
  coalesce(sum(ce.amount) filter (where ce.is_fixed_cost = false), 0)::numeric as variable_costs,
  -- Salaries
  coalesce(sum(es.monthly_salary), 0)::numeric as total_salaries,
  -- Commission calculations (simplified - actual would come from deals)
  coalesce(sum(d.commission_value), 0)::numeric as total_commissions_paid,
  -- Tax calculations
  coalesce(fs.revenue, 0)::numeric * 0.05 as withholding_tax,
  coalesce(fs.revenue, 0)::numeric * 0.14 as vat,
  -- Profit calculations
  coalesce(fs.revenue, 0)::numeric - coalesce(fs.expenses, 0)::numeric as contribution_margin,
  coalesce(fs.revenue, 0)::numeric - coalesce(fs.expenses, 0)::numeric - coalesce(sum(d.commission_value), 0)::numeric - (coalesce(fs.revenue, 0)::numeric * 0.19) as profit_before_income_tax,
  -- Net profit (without income tax for now, would be calculated based on config)
  coalesce(fs.revenue, 0)::numeric - coalesce(fs.expenses, 0)::numeric - coalesce(sum(d.commission_value), 0)::numeric - (coalesce(fs.revenue, 0)::numeric * 0.19) as net_profit
from public.business_units bu
left join public.financial_snapshots fs on fs.business_unit_id = bu.id
left join public.cost_entries ce on ce.business_unit_id = bu.id and date_trunc('month', ce.cost_month) = date_trunc('month', fs.snapshot_month)
left join public.employee_salaries es on es.organization_id = bu.organization_id
left join public.deals d on d.business_unit_id = bu.id and d.stage = 'won' and date_trunc('month', d.closed_date) = date_trunc('month', fs.snapshot_month)
group by bu.id, bu.name, bu.organization_id, fs.snapshot_month, fs.revenue, fs.expenses;

-- Organization-wide P&L
create or replace view public.organization_pnl as
select
  o.id as organization_id,
  o.name as organization_name,
  date_trunc('month', fs.snapshot_month)::date as period_month,
  sum(coalesce(fs.revenue, 0)::numeric) as total_gross_revenue,
  sum(coalesce(fs.expenses, 0)::numeric) as total_expenses,
  sum(coalesce(ce.amount, 0)::numeric) filter (where ce.is_fixed_cost = true) as total_fixed_costs,
  sum(coalesce(ce.amount, 0)::numeric) filter (where ce.is_fixed_cost = false) as total_variable_costs,
  sum(coalesce(d.commission_value, 0)::numeric) as total_commissions,
  sum(coalesce(fs.revenue, 0)::numeric) * 0.05 as total_withholding_tax,
  sum(coalesce(fs.revenue, 0)::numeric) * 0.14 as total_vat,
  sum(coalesce(fs.revenue, 0)::numeric) - sum(coalesce(fs.expenses, 0)::numeric) as contribution_margin,
  sum(coalesce(fs.revenue, 0)::numeric) - sum(coalesce(fs.expenses, 0)::numeric) - sum(coalesce(d.commission_value, 0)::numeric) - (sum(coalesce(fs.revenue, 0)::numeric) * 0.19) as profit_before_income_tax,
  sum(coalesce(fs.revenue, 0)::numeric) - sum(coalesce(fs.expenses, 0)::numeric) - sum(coalesce(d.commission_value, 0)::numeric) - (sum(coalesce(fs.revenue, 0)::numeric) * 0.19) as net_profit
from public.organizations o
left join public.financial_snapshots fs on fs.organization_id = o.id
left join public.cost_entries ce on ce.organization_id = o.id and date_trunc('month', ce.cost_month) = date_trunc('month', fs.snapshot_month)
left join public.deals d on d.organization_id = o.id and d.stage = 'won' and date_trunc('month', d.closed_date) = date_trunc('month', fs.snapshot_month)
group by o.id, o.name, date_trunc('month', fs.snapshot_month)::date;

-- Auto-calculate revenue from won deals view
create or replace view public.revenue_from_deals as
select
  d.organization_id,
  d.business_unit_id,
  date_trunc('month', d.closed_date)::date as revenue_month,
  count(*) as deals_won,
  sum(d.deal_value)::numeric as total_deal_value,
  sum(d.commission_value)::numeric as total_commission,
  sum(d.deal_value)::numeric * coalesce(avg(dcr.commission_percentage) / 100.0, 0.02) as calculated_gross_revenue
from public.deals d
left join public.developer_commission_rates dcr on dcr.id = d.developer_id
where d.stage = 'won' and d.closed_date is not null
group by d.organization_id, d.business_unit_id, date_trunc('month', d.closed_date)::date;

-- ============================================
-- MIGRATION 0019: Report Views
-- ============================================

-- Agent performance report (daily/weekly/monthly/quarterly/yearly)
create or replace view public.agent_performance_report as
select
  p.id as agent_id,
  p.full_name as agent_name,
  p.email,
  p.role,
  t.id as team_id,
  t.name as team_name,
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  -- Attendance metrics
  count(distinct al.work_date) as days_worked,
  avg(extract(epoch from (al.check_out_time - al.check_in_time)) / 3600) filter (where al.check_out_time is not null) as avg_hours_per_day,
  -- Activity metrics
  sum(dam.active_calls_count) as total_calls,
  sum(dam.meetings_scheduled) as total_meetings,
  sum(dam.requests_generated) as total_requests,
  -- Lead & deal metrics
  count(l.*) as total_leads,
  count(l.*) filter (where l.status = 'converted') as converted_leads,
  case when count(l.*) > 0 then (count(l.*) filter (where l.status = 'converted')::numeric / count(l.*)::numeric) * 100 else 0 end as conversion_rate,
  count(d.*) filter (where d.stage = 'won') as deals_won,
  sum(d.deal_value) filter (where d.stage = 'won')::numeric as total_deal_value,
  sum(d.commission_value) filter (where d.stage = 'won')::numeric as total_commission_earned,
  -- Rating metrics (calculate average from individual scores)
  avg((adr.appearance_score + adr.professionalism_score + adr.honesty_score + adr.kindness_score) / 4.0) as avg_rating_score,
  avg(adr.appearance_score) as avg_appearance,
  avg(adr.professionalism_score) as avg_professionalism,
  p.organization_id,
  date_trunc('month', coalesce(al.work_date, dam.work_date, l.received_date, d.created_at::date))::date as report_month
from public.profiles p
left join public.team_members tm on tm.user_id = p.id
left join public.teams t on t.id = tm.team_id
left join public.business_units bu on bu.id = t.business_unit_id
left join public.attendance_logs al on al.agent_id = p.id
left join public.daily_agent_metrics dam on dam.agent_id = p.id and dam.work_date = al.work_date
left join public.leads l on l.agent_id = p.id
left join public.deals d on d.agent_id = p.id
left join public.agent_daily_ratings adr on adr.agent_id = p.id
where p.role = 'sales_agent'
group by p.id, p.full_name, p.email, p.role, t.id, t.name, bu.id, bu.name, p.organization_id, 
         date_trunc('month', coalesce(al.work_date, dam.work_date, l.received_date, d.created_at::date))::date;

-- Team performance report
create or replace view public.team_performance_report as
select
  t.id as team_id,
  t.name as team_name,
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  t.leader_id,
  lp.full_name as leader_name,
  count(distinct tm.user_id) as team_size,
  -- Aggregate team metrics
  sum(dam.active_calls_count) as total_team_calls,
  sum(dam.meetings_scheduled) as total_team_meetings,
  sum(dam.requests_generated) as total_team_requests,
  count(distinct cr.id) filter (where cr.status = 'pending') as pending_requests,
  count(distinct cr.id) filter (where cr.status = 'approved') as approved_requests,
  -- Lead & deal metrics
  count(l.*) as total_team_leads,
  count(l.*) filter (where l.status = 'converted') as converted_team_leads,
  count(d.*) filter (where d.stage = 'won') as team_deals_won,
  sum(d.deal_value) filter (where d.stage = 'won')::numeric as team_total_value,
  sum(d.commission_value) filter (where d.stage = 'won')::numeric as team_total_commission,
  -- Rating averages (calculate from individual scores)
  avg((adr.appearance_score + adr.professionalism_score + adr.honesty_score + adr.kindness_score) / 4.0) as team_avg_rating,
  bu.organization_id,
  date_trunc('month', coalesce(dam.work_date, l.received_date, d.created_at::date))::date as report_month
from public.teams t
join public.business_units bu on bu.id = t.business_unit_id
left join public.profiles lp on lp.id = t.leader_id
left join public.team_members tm on tm.team_id = t.id
left join public.daily_agent_metrics dam on dam.agent_id = tm.user_id
left join public.client_requests cr on cr.team_id = t.id
left join public.leads l on l.team_id = t.id
left join public.deals d on d.team_id = t.id
left join public.agent_daily_ratings adr on adr.agent_id = tm.user_id
group by t.id, t.name, bu.id, bu.name, bu.organization_id, t.leader_id, lp.full_name,
         date_trunc('month', coalesce(dam.work_date, l.received_date, d.created_at::date))::date;

-- Business unit performance and finance combined report
create or replace view public.business_unit_combined_report as
select
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  bu.organization_id,
  o.name as organization_name,
  fs.snapshot_month as report_month,
  -- Performance metrics
  count(distinct t.id) as team_count,
  count(distinct tm.user_id) as agent_count,
  count(distinct d.id) filter (where d.stage <> 'lost') as open_deals,
  count(distinct d.id) filter (where d.stage = 'won') as won_deals,
  sum(d.deal_value) filter (where d.stage = 'won')::numeric as total_sales_value,
  -- Financial metrics
  coalesce(fs.revenue, 0)::numeric as revenue,
  coalesce(fs.expenses, 0)::numeric as expenses,
  coalesce(sum(ce.amount), 0)::numeric as detailed_costs,
  coalesce(sum(es.monthly_salary), 0)::numeric as payroll_costs,
  coalesce(sum(d.commission_value), 0)::numeric as commission_costs,
  -- Profit metrics
  coalesce(fs.revenue, 0)::numeric - coalesce(fs.expenses, 0)::numeric - coalesce(sum(d.commission_value), 0)::numeric as gross_profit,
  coalesce(fs.revenue, 0)::numeric * 0.05 as withholding_tax,
  coalesce(fs.revenue, 0)::numeric * 0.14 as vat_tax,
  coalesce(fs.revenue, 0)::numeric - coalesce(fs.expenses, 0)::numeric - coalesce(sum(d.commission_value), 0)::numeric - (coalesce(fs.revenue, 0)::numeric * 0.19) as net_profit_before_income_tax
from public.business_units bu
join public.organizations o on o.id = bu.organization_id
left join public.teams t on t.business_unit_id = bu.id
left join public.team_members tm on tm.team_id = t.id
left join public.deals d on d.business_unit_id = bu.id
left join public.financial_snapshots fs on fs.business_unit_id = bu.id
left join public.cost_entries ce on ce.business_unit_id = bu.id and date_trunc('month', ce.cost_month) = date_trunc('month', fs.snapshot_month)
left join public.employee_salaries es on es.organization_id = bu.organization_id and (es.effective_to is null or es.effective_to >= current_date)
group by bu.id, bu.name, bu.organization_id, o.name, fs.snapshot_month, fs.revenue, fs.expenses;

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================
-- Note: RLS policies are defined below. Make sure to apply them after table creation.

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
    select 1 from public.business_units bu
    join public.profiles p on p.id = auth.uid()
    where bu.id = cost_entries.business_unit_id
    and bu.organization_id = cost_entries.organization_id
    and bu.leader_id = auth.uid()
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

-- ============================================
-- FINAL SUCCESS MESSAGE
-- ============================================
select 'All migrations and RLS policies applied successfully! New tables created: attendance_logs, client_requests, daily_agent_metrics, meetings, agent_daily_ratings, leads, cost_entries, employee_salaries, commission_config, tax_config, developer_commission_rates. Views created: P&L statements and report views. RLS policies enabled for all new tables.' as status;

-- ============================================
-- AGENT DAILY RATINGS UPDATE RLS
-- ============================================

drop policy if exists "Team leaders can update ratings" on public.agent_daily_ratings;

create policy "Team leaders can update ratings"
on public.agent_daily_ratings
for update
using (
  rated_by = auth.uid()
  and exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = agent_daily_ratings.agent_id
  )
)
with check (
  rated_by = auth.uid()
  and exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = agent_daily_ratings.agent_id
  )
);

