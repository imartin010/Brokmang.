-- Lead tracking and conversion system
set check_function_bodies = off;
set search_path = public;

-- Lead status enum
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost');

-- Leads table
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  source_id uuid references public.deal_sources(id) on delete set null,
  client_name text not null,
  client_phone text,
  client_email text,
  destination text,
  estimated_budget numeric(14,2),
  project_type text,
  status public.lead_status not null default 'new',
  converted_deal_id uuid references public.deals(id) on delete set null,
  received_date date not null default current_date,
  contacted_date date,
  qualified_date date,
  converted_date date,
  lost_date date,
  lost_reason text,
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_agent_idx on public.leads (agent_id);
create index leads_team_idx on public.leads (team_id);
create index leads_status_idx on public.leads (status);
create index leads_source_idx on public.leads (source_id);
create index leads_received_date_idx on public.leads (received_date);
create index leads_org_idx on public.leads (organization_id);

create trigger leads_updated_at
before update on public.leads
for each row
execute procedure public.set_updated_at();

-- View for lead conversion metrics per agent
create or replace view public.lead_conversion_metrics as
select
  l.agent_id,
  p.full_name as agent_name,
  count(*) as total_leads,
  count(*) filter (where l.status = 'new') as new_leads,
  count(*) filter (where l.status = 'contacted') as contacted_leads,
  count(*) filter (where l.status = 'qualified') as qualified_leads,
  count(*) filter (where l.status = 'converted') as converted_leads,
  count(*) filter (where l.status = 'lost') as lost_leads,
  case 
    when count(*) > 0 
    then (count(*) filter (where l.status = 'converted')::numeric / count(*)::numeric) * 100
    else 0
  end as conversion_rate,
  avg(extract(day from (l.converted_date - l.received_date))) filter (where l.status = 'converted') as avg_days_to_convert,
  sum(d.deal_value) as total_converted_value
from public.leads l
join public.profiles p on p.id = l.agent_id
left join public.deals d on d.id = l.converted_deal_id
group by l.agent_id, p.full_name;

-- View for team lead conversion metrics
create or replace view public.team_lead_conversion as
select
  t.id as team_id,
  t.name as team_name,
  count(distinct l.agent_id) as active_agents,
  count(l.*) as total_leads,
  count(l.*) filter (where l.status = 'converted') as converted_leads,
  case 
    when count(l.*) > 0 
    then (count(l.*) filter (where l.status = 'converted')::numeric / count(l.*)::numeric) * 100
    else 0
  end as team_conversion_rate,
  sum(d.deal_value) filter (where l.status = 'converted') as total_converted_value
from public.teams t
left join public.team_members tm on tm.team_id = t.id
left join public.leads l on l.agent_id = tm.user_id
left join public.deals d on d.id = l.converted_deal_id
group by t.id, t.name;

comment on table public.leads is 'Lead tracking separate from deals for conversion funnel analysis.';
comment on view public.lead_conversion_metrics is 'Lead-to-deal conversion metrics per agent.';
comment on view public.team_lead_conversion is 'Team-level lead conversion performance.';

