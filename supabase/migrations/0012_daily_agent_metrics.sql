-- Daily metrics for agents: calls, meetings, mood tracking
set check_function_bodies = off;
set search_path = public;

-- Daily agent metrics table
create table public.daily_agent_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  work_date date not null default current_date,
  active_calls_count int not null default 0,
  meetings_scheduled int not null default 0,
  requests_generated int not null default 0,
  deals_closed int not null default 0,
  mood text check (mood in ('great', 'good', 'okay', 'stressed', 'difficult')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, work_date)
);

create index daily_agent_metrics_agent_idx on public.daily_agent_metrics (agent_id);
create index daily_agent_metrics_date_idx on public.daily_agent_metrics (work_date);
create index daily_agent_metrics_org_idx on public.daily_agent_metrics (organization_id);

create trigger daily_agent_metrics_updated_at
before update on public.daily_agent_metrics
for each row
execute procedure public.set_updated_at();

-- View for agent performance including daily metrics
create or replace view public.agent_daily_summary as
select
  dam.agent_id,
  p.full_name as agent_name,
  dam.work_date,
  coalesce(dam.active_calls_count, 0) as calls_made,
  coalesce(dam.meetings_scheduled, 0) as meetings,
  coalesce(dam.requests_generated, 0) as requests,
  coalesce(dam.deals_closed, 0) as deals,
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

comment on table public.daily_agent_metrics is 'Daily performance metrics tracked by sales agents.';
comment on view public.agent_daily_summary is 'Combined view of attendance and daily metrics for agents.';

