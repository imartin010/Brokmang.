-- Profit and Loss statement views with full calculations
set check_function_bodies = off;
set search_path = public;

-- Comprehensive P&L view per business unit
create or replace view public.business_unit_pnl as
select
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  bu.organization_id,
  fs.snapshot_month as period_month,
  -- Revenue
  coalesce(fs.revenue, 0) as gross_revenue,
  -- Expenses
  coalesce(fs.expenses, 0) as total_expenses,
  coalesce(sum(ce.amount) filter (where ce.is_fixed_cost = true), 0) as fixed_costs,
  coalesce(sum(ce.amount) filter (where ce.is_fixed_cost = false), 0) as variable_costs,
  -- Salaries
  coalesce(sum(es.monthly_salary), 0) as total_salaries,
  -- Commission calculations (simplified - actual would come from deals)
  coalesce(sum(d.commission_value), 0) as total_commissions_paid,
  -- Tax calculations
  coalesce(fs.revenue * 0.05, 0) as withholding_tax,
  coalesce(fs.revenue * 0.14, 0) as vat,
  -- Profit calculations
  coalesce(fs.revenue, 0) - coalesce(fs.expenses, 0) as contribution_margin,
  coalesce(fs.revenue, 0) - coalesce(fs.expenses, 0) - coalesce(sum(d.commission_value), 0) - (coalesce(fs.revenue, 0) * 0.19) as profit_before_income_tax,
  -- Net profit (without income tax for now, would be calculated based on config)
  coalesce(fs.revenue, 0) - coalesce(fs.expenses, 0) - coalesce(sum(d.commission_value), 0) - (coalesce(fs.revenue, 0) * 0.19) as net_profit
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
  sum(coalesce(fs.revenue, 0)) as total_gross_revenue,
  sum(coalesce(fs.expenses, 0)) as total_expenses,
  sum(coalesce(ce.amount, 0)) filter (where ce.is_fixed_cost = true) as total_fixed_costs,
  sum(coalesce(ce.amount, 0)) filter (where ce.is_fixed_cost = false) as total_variable_costs,
  sum(coalesce(d.commission_value, 0)) as total_commissions,
  sum(coalesce(fs.revenue, 0)) * 0.05 as total_withholding_tax,
  sum(coalesce(fs.revenue, 0)) * 0.14 as total_vat,
  sum(coalesce(fs.revenue, 0)) - sum(coalesce(fs.expenses, 0)) as contribution_margin,
  sum(coalesce(fs.revenue, 0)) - sum(coalesce(fs.expenses, 0)) - sum(coalesce(d.commission_value, 0)) - (sum(coalesce(fs.revenue, 0)) * 0.19) as profit_before_income_tax,
  sum(coalesce(fs.revenue, 0)) - sum(coalesce(fs.expenses, 0)) - sum(coalesce(d.commission_value, 0)) - (sum(coalesce(fs.revenue, 0)) * 0.19) as net_profit
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
  sum(d.deal_value) as total_deal_value,
  sum(d.commission_value) as total_commission,
  sum(d.deal_value) * coalesce(avg(dcr.commission_percentage) / 100.0, 0.02) as calculated_gross_revenue
from public.deals d
left join public.developer_commission_rates dcr on dcr.id = d.developer_id
where d.stage = 'won' and d.closed_date is not null
group by d.organization_id, d.business_unit_id, date_trunc('month', d.closed_date)::date;

comment on table public.commission_config is 'Commission rates configuration per role (e.g., 6000 EGP per 1M for agents).';
comment on table public.developer_commission_rates is 'Variable commission rates per developer/project for accurate revenue calculation.';
comment on table public.tax_config is 'Tax rates including withholding (5%), VAT (14%), and variable income tax.';
comment on view public.business_unit_pnl is 'Full Profit & Loss statement per business unit with all deductions.';
comment on view public.organization_pnl is 'Organization-wide P&L aggregating all business units.';
comment on view public.revenue_from_deals is 'Auto-calculated revenue from closed deals based on commission rates.';

