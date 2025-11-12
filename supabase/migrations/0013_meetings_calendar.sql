-- Meeting and calendar system for agents
set check_function_bodies = off;
set search_path = public;

-- Meeting status enum
create type public.meeting_status as enum ('scheduled', 'completed', 'cancelled', 'rescheduled');

-- Meetings table
create table public.meetings (
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

create index meetings_agent_idx on public.meetings (agent_id);
create index meetings_date_idx on public.meetings (meeting_date);
create index meetings_status_idx on public.meetings (status);
create index meetings_org_idx on public.meetings (organization_id);

create trigger meetings_updated_at
before update on public.meetings
for each row
execute procedure public.set_updated_at();

-- View for upcoming meetings
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

comment on table public.meetings is 'Scheduled meetings for sales agents with clients and prospects.';
comment on view public.upcoming_meetings is 'Upcoming scheduled meetings for agents.';

