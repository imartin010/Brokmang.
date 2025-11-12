set check_function_bodies = off;
set search_path = public;

create or replace view public.team_leader_dashboard as
select
  t.id as team_id,
  t.name as team_name,
  t.leader_id,
  bu.id as business_unit_id,
  bu.name as business_unit_name,
  bu.organization_id,
  count(distinct tm.user_id) as member_count,
  count(distinct d.id) filter (where d.stage <> 'lost') as open_deals,
  coalesce(sum(d.deal_value) filter (where d.stage = 'won'), 0)::numeric(14,2) as total_closed_value,
  coalesce(sum(d.commission_value) filter (where d.stage = 'won'), 0)::numeric(14,2) as total_commission,
  coalesce(sum(d.deal_value * (d.probability / 100.0)) filter (where d.stage <> 'lost'), 0)::numeric(14,2) as weighted_pipeline
from public.teams t
join public.business_units bu on bu.id = t.business_unit_id
left join public.team_members tm on tm.team_id = t.id
left join public.deals d on d.team_id = t.id
group by t.id, bu.id;

create or replace view public.team_member_performance as
select
  t.id as team_id,
  d.agent_id,
  p.full_name as agent_name,
  count(d.*) filter (where d.stage <> 'lost') as open_deals,
  coalesce(sum(d.deal_value) filter (where d.stage = 'won'), 0)::numeric(14,2) as closed_value,
  coalesce(sum(d.commission_value) filter (where d.stage = 'won'), 0)::numeric(14,2) as commission_value,
  coalesce(avg(d.probability) filter (where d.stage <> 'lost'), 0)::numeric(5,2) as avg_probability
from public.teams t
join public.team_members tm on tm.team_id = t.id
join public.profiles p on p.id = tm.user_id
left join public.deals d on d.agent_id = tm.user_id
group by t.id, d.agent_id, p.full_name;

comment on view public.team_leader_dashboard is
  'Aggregated metrics per team for leaders, managers, and business unit heads.';

comment on view public.team_member_performance is
  'Per-agent performance summaries scoped to a team.';
