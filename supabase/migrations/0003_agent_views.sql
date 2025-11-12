set check_function_bodies = off;
set search_path = public;

create or replace view public.agent_dashboard_summary as
select
  p.id as agent_id,
  p.full_name,
  p.preferred_name,
  p.email,
  count(d.*) filter (where d.stage <> 'lost') as open_deals,
  count(d.*) filter (where d.stage = 'won' and d.closed_date between date_trunc('week', now()) and now()) as wins_this_week,
  coalesce(sum(d.deal_value) filter (where d.stage = 'won'), 0)::numeric(14,2) as total_closed_value,
  coalesce(sum(d.commission_value) filter (where d.stage = 'won'), 0)::numeric(14,2) as total_commission,
  coalesce(sum(d.deal_value * (d.probability / 100.0)) filter (where d.stage <> 'lost'), 0)::numeric(14,2) as weighted_pipeline
from public.profiles p
left join public.deals d on d.agent_id = p.id
group by p.id;

create or replace view public.agent_daily_activity as
select
  d.agent_id,
  da.activity_at::date as activity_date,
  da.activity_type,
  count(*) as activity_count,
  array_agg(jsonb_build_object('id', da.id, 'summary', da.summary, 'at', da.activity_at) order by da.activity_at desc) as activity_entries
from public.deal_activities da
join public.deals d on d.id = da.deal_id
group by d.agent_id, da.activity_at::date, da.activity_type;

comment on view public.agent_dashboard_summary is
  'Aggregated deal pipeline and performance metrics for sales agents.';

comment on view public.agent_daily_activity is
  'Daily grouped activity timeline derived from deal activities per agent.';
