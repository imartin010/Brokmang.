-- brokmang. initial schema
-- Generated to support brokerage performance management workflows.

set check_function_bodies = off;
set search_path = public;

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create type public.user_role as enum (
  'sales_agent',
  'team_leader',
  'sales_manager',
  'finance',
  'business_unit_head',
  'ceo',
  'admin'
);

create type public.deal_stage as enum (
  'prospecting',
  'qualified',
  'negotiation',
  'contract_sent',
  'won',
  'lost'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  timezone text not null default 'UTC',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_updated_at
before update on public.organizations
for each row
execute procedure public.set_updated_at();

create table public.business_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  leader_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index business_units_org_idx on public.business_units (organization_id);
create unique index business_units_org_name_unique
  on public.business_units (organization_id, lower(name));

create trigger business_units_updated_at
before update on public.business_units
for each row
execute procedure public.set_updated_at();

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  business_unit_id uuid not null references public.business_units(id) on delete cascade,
  name text not null,
  leader_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index teams_business_unit_idx on public.teams (business_unit_id);
create unique index teams_business_unit_name_unique
  on public.teams (business_unit_id, lower(name));

create trigger teams_updated_at
before update on public.teams
for each row
execute procedure public.set_updated_at();

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  preferred_name text,
  email text,
  role public.user_role not null,
  avatar_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create index profiles_org_idx on public.profiles (organization_id);
create index profiles_role_idx on public.profiles (role);

create trigger profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_role public.user_role not null default 'sales_agent',
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index team_members_user_idx on public.team_members (user_id);

create table public.deal_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index deal_sources_org_name_unique
  on public.deal_sources (organization_id, lower(name));

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_unit_id uuid references public.business_units(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  agent_id uuid references public.profiles(id) on delete set null,
  source_id uuid references public.deal_sources(id) on delete set null,
  name text not null,
  stage public.deal_stage not null default 'prospecting',
  expected_close_date date,
  closed_date date,
  deal_value numeric(14,2) not null default 0,
  commission_value numeric(14,2) not null default 0,
  probability numeric(5,2) not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_org_idx on public.deals (organization_id);
create index deals_business_unit_idx on public.deals (business_unit_id);
create index deals_team_idx on public.deals (team_id);
create index deals_agent_idx on public.deals (agent_id);
create index deals_stage_idx on public.deals (stage);
create index deals_expected_close_idx on public.deals (expected_close_date);

create trigger deals_updated_at
before update on public.deals
for each row
execute procedure public.set_updated_at();

create table public.deal_activities (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  performed_by uuid not null references public.profiles(id) on delete set null,
  activity_type text not null,
  summary text not null,
  activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index deal_activities_deal_idx on public.deal_activities (deal_id);

create table public.performance_cycles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index performance_cycles_org_name_unique
  on public.performance_cycles (organization_id, lower(name));

create trigger performance_cycles_updated_at
before update on public.performance_cycles
for each row
execute procedure public.set_updated_at();

create table public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.performance_cycles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(5,2) not null,
  strengths text,
  opportunities text,
  action_plan text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cycle_id, reviewee_id, reviewer_id)
);

create index performance_reviews_cycle_idx on public.performance_reviews (cycle_id);
create index performance_reviews_reviewee_idx on public.performance_reviews (reviewee_id);
create index performance_reviews_reviewer_idx on public.performance_reviews (reviewer_id);

create trigger performance_reviews_updated_at
before update on public.performance_reviews
for each row
execute procedure public.set_updated_at();

create table public.financial_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_unit_id uuid references public.business_units(id) on delete cascade,
  snapshot_month date not null,
  revenue numeric(14,2) not null default 0,
  expenses numeric(14,2) not null default 0,
  contribution_margin numeric(14,2) generated always as (revenue - expenses) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (business_unit_id, snapshot_month)
);

create index financial_snapshots_org_idx on public.financial_snapshots (organization_id);
create index financial_snapshots_month_idx on public.financial_snapshots (snapshot_month);

create table public.kpi_targets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_unit_id uuid references public.business_units(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  metric text not null,
  target_value numeric(14,2) not null,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index kpi_targets_team_unique
  on public.kpi_targets (team_id, metric, period_start, period_end)
  where team_id is not null;

create unique index kpi_targets_business_unit_unique
  on public.kpi_targets (business_unit_id, metric, period_start, period_end)
  where team_id is null and business_unit_id is not null;

create trigger kpi_targets_updated_at
before update on public.kpi_targets
for each row
execute procedure public.set_updated_at();

create table public.ai_insight_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  initiated_by uuid not null references public.profiles(id) on delete set null,
  scope text not null,
  input jsonb not null,
  output jsonb,
  status text not null default 'pending',
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index ai_insight_runs_org_idx on public.ai_insight_runs (organization_id);
create index ai_insight_runs_status_idx on public.ai_insight_runs (status);

comment on table public.organizations is 'Root brokerage organizations for brokmang.';
comment on table public.business_units is 'Business units or regions within the brokerage.';
comment on table public.teams is 'Sales teams reporting into a business unit.';
comment on table public.profiles is 'Extended user metadata synchronized with auth.users.';
comment on table public.team_members is 'Membership assignments for users within teams.';
comment on table public.deal_sources is 'Lead and deal sourcing channels.';
comment on table public.deals is 'Deals/opportunities tracked by agents and teams.';
comment on table public.deal_activities is 'Activity timeline for deals.';
comment on table public.performance_cycles is 'Review cycles for performance evaluations.';
comment on table public.performance_reviews is 'Peer/manager reviews captured per cycle.';
comment on table public.financial_snapshots is 'Monthly financial metrics used by Finance and BU Heads.';
comment on table public.kpi_targets is 'Target metrics for teams or business units.';
comment on table public.ai_insight_runs is 'Audit log of AI insight generations.';


