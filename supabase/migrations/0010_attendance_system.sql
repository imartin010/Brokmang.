-- Attendance and check-in/check-out system for agents
set check_function_bodies = off;
set search_path = public;

-- Attendance logs table
create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  check_in_time timestamptz not null,
  check_out_time timestamptz,
  work_date date not null default current_date,
  location_check_in text,
  location_check_out text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, work_date)
);

create index attendance_logs_agent_idx on public.attendance_logs (agent_id);
create index attendance_logs_date_idx on public.attendance_logs (work_date);
create index attendance_logs_org_idx on public.attendance_logs (organization_id);

create trigger attendance_logs_updated_at
before update on public.attendance_logs
for each row
execute procedure public.set_updated_at();

-- View for today's attendance
create or replace view public.attendance_today as
select
  al.id,
  al.agent_id,
  p.full_name as agent_name,
  p.email,
  al.check_in_time,
  al.check_out_time,
  al.work_date,
  case 
    when al.check_out_time is not null then extract(epoch from (al.check_out_time - al.check_in_time)) / 3600
    else null
  end as hours_worked,
  al.organization_id,
  al.location_check_in,
  al.location_check_out
from public.attendance_logs al
join public.profiles p on p.id = al.agent_id
where al.work_date = current_date;

comment on table public.attendance_logs is 'Daily check-in and check-out records for sales agents.';
comment on view public.attendance_today is 'Today''s attendance status for all agents.';

