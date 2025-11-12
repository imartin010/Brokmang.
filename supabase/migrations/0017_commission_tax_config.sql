-- Commission and tax configuration system
set check_function_bodies = off;
set search_path = public;

-- Commission configuration per role
create table public.commission_config (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role public.user_role not null,
  base_rate_per_million numeric(14,2) not null, -- e.g., 6000 for agents
  description text,
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, role, effective_from)
);

create index commission_config_org_role_idx on public.commission_config (organization_id, role);

create trigger commission_config_updated_at
before update on public.commission_config
for each row
execute procedure public.set_updated_at();

-- Developer/project commission rates (variable per deal)
create table public.developer_commission_rates (
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

create index developer_commission_org_idx on public.developer_commission_rates (organization_id);
create index developer_commission_active_idx on public.developer_commission_rates (is_active);

create trigger developer_commission_rates_updated_at
before update on public.developer_commission_rates
for each row
execute procedure public.set_updated_at();

-- Link deals to developers
alter table public.deals add column if not exists developer_id uuid references public.developer_commission_rates(id) on delete set null;

-- Tax configuration
create table public.tax_config (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  withholding_tax_rate numeric(5,4) not null default 0.05, -- 5%
  vat_rate numeric(5,4) not null default 0.14, -- 14%
  income_tax_rate numeric(5,4) not null default 0, -- Variable, configurable
  effective_from date not null default current_date,
  effective_to date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, effective_from)
);

create index tax_config_org_idx on public.tax_config (organization_id);
create index tax_config_effective_idx on public.tax_config (effective_from, effective_to);

create trigger tax_config_updated_at
before update on public.tax_config
for each row
execute procedure public.set_updated_at();

-- Function to calculate team commission for a deal
create or replace function public.calculate_team_commission(
  p_deal_value numeric,
  p_organization_id uuid
) returns jsonb
language plpgsql
stable
as $$
declare
  v_result jsonb := '{}'::jsonb;
  v_agent_rate numeric;
  v_leader_rate numeric;
  v_manager_rate numeric;
begin
  -- Get commission rates
  select base_rate_per_million into v_agent_rate
  from public.commission_config
  where organization_id = p_organization_id 
    and role = 'sales_agent'
    and (effective_to is null or effective_to >= current_date)
  order by effective_from desc
  limit 1;
  
  select base_rate_per_million into v_leader_rate
  from public.commission_config
  where organization_id = p_organization_id 
    and role = 'team_leader'
    and (effective_to is null or effective_to >= current_date)
  order by effective_from desc
  limit 1;
  
  select base_rate_per_million into v_manager_rate
  from public.commission_config
  where organization_id = p_organization_id 
    and role = 'sales_manager'
    and (effective_to is null or effective_to >= current_date)
  order by effective_from desc
  limit 1;
  
  -- Calculate commissions
  v_result := jsonb_build_object(
    'agent_commission', (p_deal_value / 1000000.0) * coalesce(v_agent_rate, 6000),
    'leader_commission', (p_deal_value / 1000000.0) * coalesce(v_leader_rate, 2500),
    'manager_commission', (p_deal_value / 1000000.0) * coalesce(v_manager_rate, 1500),
    'total_commission', (p_deal_value / 1000000.0) * (coalesce(v_agent_rate, 6000) + coalesce(v_leader_rate, 2500) + coalesce(v_manager_rate, 1500))
  );
  
  return v_result;
end;
$$;

-- Function to calculate taxes and net profit
create or replace function public.calculate_net_profit(
  p_gross_revenue numeric,
  p_total_expenses numeric,
  p_total_commission numeric,
  p_organization_id uuid
) returns jsonb
language plpgsql
stable
as $$
declare
  v_result jsonb;
  v_withholding_rate numeric;
  v_vat_rate numeric;
  v_income_tax_rate numeric;
  v_withholding_tax numeric;
  v_vat numeric;
  v_income_tax numeric;
  v_profit_before_tax numeric;
  v_net_profit numeric;
begin
  -- Get tax rates
  select withholding_tax_rate, vat_rate, income_tax_rate
  into v_withholding_rate, v_vat_rate, v_income_tax_rate
  from public.tax_config
  where organization_id = p_organization_id
    and (effective_to is null or effective_to >= current_date)
  order by effective_from desc
  limit 1;
  
  -- Default rates if not configured
  v_withholding_rate := coalesce(v_withholding_rate, 0.05);
  v_vat_rate := coalesce(v_vat_rate, 0.14);
  v_income_tax_rate := coalesce(v_income_tax_rate, 0);
  
  -- Calculate taxes
  v_withholding_tax := p_gross_revenue * v_withholding_rate;
  v_vat := p_gross_revenue * v_vat_rate;
  v_profit_before_tax := p_gross_revenue - p_total_expenses - p_total_commission - v_withholding_tax - v_vat;
  v_income_tax := v_profit_before_tax * v_income_tax_rate;
  v_net_profit := v_profit_before_tax - v_income_tax;
  
  v_result := jsonb_build_object(
    'gross_revenue', p_gross_revenue,
    'total_expenses', p_total_expenses,
    'total_commission', p_total_commission,
    'withholding_tax', v_withholding_tax,
    'withholding_tax_rate', v_withholding_rate,
    'vat', v_vat,
    'vat_rate', v_vat_rate,
    'profit_before_income_tax', v_profit_before_tax,
    'income_tax', v_income_tax,
    'income_tax_rate', v_income_tax_rate,
    'net_profit', v_net_profit
  );
  
  return v_result;
end;
$$;

comment on table public.commission_config is 'Commission rates per role, configurable per organization.';
comment on table public.developer_commission_rates is 'Variable commission rates per developer/project.';
comment on table public.tax_config is 'Tax configuration including withholding, VAT, and income tax rates.';
comment on function public.calculate_team_commission is 'Calculate commission breakdown for sales team based on deal value.';
comment on function public.calculate_net_profit is 'Calculate net profit after all expenses, commissions, and taxes.';

