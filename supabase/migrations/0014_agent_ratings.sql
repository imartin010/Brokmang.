-- Agent rating and evaluation system for team leaders
set check_function_bodies = off;
set search_path = public;

-- Agent daily ratings table
create table public.agent_daily_ratings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.profiles(id) on delete cascade,
  rated_by uuid not null references public.profiles(id) on delete cascade,
  rating_date date not null default current_date,
  appearance_score int check (appearance_score between 1 and 10),
  professionalism_score int check (professionalism_score between 1 and 10),
  honesty_score int check (honesty_score between 1 and 10),
  kindness_score int check (kindness_score between 1 and 10),
  overall_score numeric(4,2) generated always as (
    (coalesce(appearance_score, 0) + coalesce(professionalism_score, 0) + 
     coalesce(honesty_score, 0) + coalesce(kindness_score, 0)) / 4.0
  ) stored,
  leads_received_count int default 0,
  deals_closed_count int default 0,
  conversion_rate numeric(5,2) generated always as (
    case when leads_received_count > 0 
    then (deals_closed_count::numeric / leads_received_count::numeric) * 100
    else 0 end
  ) stored,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, rating_date, rated_by)
);

create index agent_daily_ratings_agent_idx on public.agent_daily_ratings (agent_id);
create index agent_daily_ratings_date_idx on public.agent_daily_ratings (rating_date);
create index agent_daily_ratings_rater_idx on public.agent_daily_ratings (rated_by);
create index agent_daily_ratings_org_idx on public.agent_daily_ratings (organization_id);

create trigger agent_daily_ratings_updated_at
before update on public.agent_daily_ratings
for each row
execute procedure public.set_updated_at();

-- Add supervision fields to profiles
alter table public.profiles add column if not exists under_supervision boolean default false;
alter table public.profiles add column if not exists supervised_by uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists supervision_started_at timestamptz;

-- View for agent ratings summary
create or replace view public.agent_rating_summary as
select
  adr.agent_id,
  p.full_name as agent_name,
  count(*) as total_ratings,
  avg(adr.appearance_score) as avg_appearance,
  avg(adr.professionalism_score) as avg_professionalism,
  avg(adr.honesty_score) as avg_honesty,
  avg(adr.kindness_score) as avg_kindness,
  avg(adr.overall_score) as avg_overall_score,
  sum(adr.leads_received_count) as total_leads_received,
  sum(adr.deals_closed_count) as total_deals_closed,
  case 
    when sum(adr.leads_received_count) > 0 
    then (sum(adr.deals_closed_count)::numeric / sum(adr.leads_received_count)::numeric) * 100
    else 0 
  end as overall_conversion_rate,
  max(adr.rating_date) as last_rated_date
from public.agent_daily_ratings adr
join public.profiles p on p.id = adr.agent_id
where adr.rating_date >= current_date - interval '30 days'
group by adr.agent_id, p.full_name;

comment on table public.agent_daily_ratings is 'Daily ratings of agent appearance, behavior, and performance by team leaders.';
comment on view public.agent_rating_summary is '30-day rolling summary of agent ratings and conversion metrics.';

