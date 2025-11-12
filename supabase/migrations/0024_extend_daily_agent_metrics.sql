-- Extend daily agent metrics with workflow fields to support agent workflow dashboard
set check_function_bodies = off;
set search_path = public;

alter table public.daily_agent_metrics
  add column if not exists leads_taken_count int not null default 0,
  add column if not exists cold_calls_count int not null default 0,
  add column if not exists meetings_completed int not null default 0,
  add column if not exists orientation text check (orientation in ('team', 'developer'));

comment on column public.daily_agent_metrics.leads_taken_count is 'Number of leads claimed by the agent for the work date.';
comment on column public.daily_agent_metrics.cold_calls_count is 'Number of cold calls completed by the agent for the work date.';
comment on column public.daily_agent_metrics.meetings_completed is 'Number of meetings completed (logged) by the agent for the work date.';
comment on column public.daily_agent_metrics.orientation is 'Morning knowledge orientation selected by the agent for the work date.';

-- Ensure orientation defaults to null when not provided
alter table public.daily_agent_metrics
  alter column orientation set default null;


