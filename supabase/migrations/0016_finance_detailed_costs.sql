-- Detailed finance cost tracking system
set check_function_bodies = off;
set search_path = public;

-- Cost category enum
create type public.cost_category as enum (
  'rent',
  'salary_agent',
  'salary_team_leader',
  'salary_sales_manager',
  'salary_bu_head',
  'salary_finance',
  'salary_ceo',
  'salary_admin',
  'marketing',
  'phone_bills',
  'utilities',
  'software_subscriptions',
  'office_supplies',
  'travel',
  'training',
  'other_fixed',
  'other_variable'
);

-- Cost entries table
create table public.cost_entries (
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

create index cost_entries_bu_idx on public.cost_entries (business_unit_id);
create index cost_entries_month_idx on public.cost_entries (cost_month);
create index cost_entries_category_idx on public.cost_entries (category);
create index cost_entries_org_idx on public.cost_entries (organization_id);

create trigger cost_entries_updated_at
before update on public.cost_entries
for each row
execute procedure public.set_updated_at();

-- Employee salaries table
create table public.employee_salaries (
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

create index employee_salaries_employee_idx on public.employee_salaries (employee_id);
create index employee_salaries_effective_idx on public.employee_salaries (effective_from, effective_to);
create index employee_salaries_org_idx on public.employee_salaries (organization_id);

create trigger employee_salaries_updated_at
before update on public.employee_salaries
for each row
execute procedure public.set_updated_at();

-- View for current salaries
create or replace view public.current_salaries as
select
  es.employee_id,
  p.full_name as employee_name,
  p.role,
  es.monthly_salary,
  es.currency,
  es.effective_from,
  es.organization_id,
  bu.id as business_unit_id,
  bu.name as business_unit_name
from public.employee_salaries es
join public.profiles p on p.id = es.employee_id
left join public.business_units bu on bu.organization_id = es.organization_id
where es.effective_to is null 
   or es.effective_to >= current_date
order by p.role, p.full_name;

-- View for monthly cost summary per business unit
create or replace view public.monthly_costs_by_bu as
select
  coalesce(ce.business_unit_id, bu.id) as business_unit_id,
  bu.name as business_unit_name,
  ce.cost_month,
  sum(ce.amount) filter (where ce.is_fixed_cost = true) as total_fixed_costs,
  sum(ce.amount) filter (where ce.is_fixed_cost = false) as total_variable_costs,
  sum(ce.amount) as total_costs,
  ce.organization_id
from public.business_units bu
left join public.cost_entries ce on ce.business_unit_id = bu.id
group by coalesce(ce.business_unit_id, bu.id), bu.name, ce.cost_month, ce.organization_id;

comment on table public.cost_entries is 'Detailed cost tracking with categories for fixed and variable expenses.';
comment on table public.employee_salaries is 'Historical salary records for all employees.';
comment on view public.current_salaries is 'Current active salaries for all employees.';
comment on view public.monthly_costs_by_bu is 'Monthly cost aggregation per business unit.';

