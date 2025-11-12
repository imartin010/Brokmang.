-- Client request management system for agents and team leaders
set check_function_bodies = off;
set search_path = public;

-- Request status enum
create type public.request_status as enum ('pending', 'approved', 'rejected', 'converted');

-- Client requests table
create table public.client_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  team_leader_id uuid references public.profiles(id) on delete set null,
  status public.request_status not null default 'pending',
  client_name text not null,
  client_phone text not null,
  destination text not null,
  client_budget numeric(14,2) not null,
  project_needed text not null,
  delivery_date date,
  agent_notes text,
  leader_notes text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  converted_deal_id uuid references public.deals(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index client_requests_agent_idx on public.client_requests (agent_id);
create index client_requests_status_idx on public.client_requests (status);
create index client_requests_team_leader_idx on public.client_requests (team_leader_id);
create index client_requests_org_idx on public.client_requests (organization_id);

create trigger client_requests_updated_at
before update on public.client_requests
for each row
execute procedure public.set_updated_at();

-- View for pending requests per team leader
create or replace view public.pending_requests_by_leader as
select
  cr.id,
  cr.agent_id,
  p.full_name as agent_name,
  cr.team_leader_id,
  cr.client_name,
  cr.client_phone,
  cr.destination,
  cr.client_budget,
  cr.project_needed,
  cr.delivery_date,
  cr.agent_notes,
  cr.created_at,
  cr.organization_id
from public.client_requests cr
join public.profiles p on p.id = cr.agent_id
where cr.status = 'pending'
order by cr.created_at desc;

comment on table public.client_requests is 'Client requests submitted by agents for team leader review and approval.';
comment on view public.pending_requests_by_leader is 'Pending client requests grouped by team leader for approval workflow.';

