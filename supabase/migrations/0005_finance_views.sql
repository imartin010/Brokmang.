set check_function_bodies = off;
set search_path = public;

create or replace view public.business_unit_finance_overview as
select
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  bu.organization_id,
  coalesce(sum(fs.revenue), 0)::numeric(14,2) as total_revenue,
  coalesce(sum(fs.expenses), 0)::numeric(14,2) as total_expenses,
  coalesce(sum(fs.contribution_margin), 0)::numeric(14,2) as total_margin,
  avg(fs.contribution_margin) filter (
    where fs.snapshot_month >= (date_trunc('month', now()) - interval '2 months')
  )::numeric(14,2) as trailing_three_month_margin
from public.business_units bu
left join public.financial_snapshots fs on fs.business_unit_id = bu.id
group by bu.id;

create or replace view public.monthly_finance_trends as
select
  fs.business_unit_id,
  bu.name as business_unit_name,
  fs.snapshot_month,
  fs.revenue,
  fs.expenses,
  fs.contribution_margin
from public.financial_snapshots fs
join public.business_units bu on bu.id = fs.business_unit_id;

comment on view public.business_unit_finance_overview is
  'Aggregated revenue, expense, and margin metrics per business unit.';

comment on view public.monthly_finance_trends is
  'Month-over-month financial performance used in finance dashboards.';
