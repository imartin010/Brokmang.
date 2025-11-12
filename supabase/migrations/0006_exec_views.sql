set check_function_bodies = off;
set search_path = public;

create or replace view public.organization_overview as
select
  o.id as organization_id,
  o.name as organization_name,
  count(distinct bu.id) as business_unit_count,
  count(distinct t.id) as team_count,
  count(distinct p.id) as member_count,
  coalesce(sum(fs.revenue), 0)::numeric(14,2) as total_revenue,
  coalesce(sum(fs.expenses), 0)::numeric(14,2) as total_expenses,
  coalesce(sum(fs.contribution_margin), 0)::numeric(14,2) as total_margin
from public.organizations o
left join public.business_units bu on bu.organization_id = o.id
left join public.teams t on t.business_unit_id = bu.id
left join public.profiles p on p.organization_id = o.id
left join public.financial_snapshots fs on fs.organization_id = o.id
group by o.id;

create or replace view public.pipeline_performance as
select
  o.id as organization_id,
  date_trunc('month', d.created_at) as pipeline_month,
  count(d.*) filter (where d.stage <> 'lost') as open_deals,
  count(d.*) filter (where d.stage = 'won') as closed_deals,
  coalesce(sum(d.deal_value) filter (where d.stage = 'won'), 0)::numeric(14,2) as closed_value,
  coalesce(sum(d.deal_value * (d.probability / 100.0)) filter (where d.stage <> 'lost'), 0)::numeric(14,2) as weighted_pipeline
from public.organizations o
join public.deals d on d.organization_id = o.id
group by o.id, date_trunc('month', d.created_at);

comment on view public.organization_overview is
  'Executive-level summary metrics across the entire organization.';

comment on view public.pipeline_performance is
  'Monthly pipeline metrics for executive analytics.';
