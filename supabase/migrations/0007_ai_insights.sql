set check_function_bodies = off;
set search_path = public;

create or replace view public.ai_insight_recent as
select
  air.id,
  air.organization_id,
  air.initiated_by,
  air.scope,
  air.status,
  air.created_at,
  air.completed_at,
  air.output
from public.ai_insight_runs air
where air.created_at > now() - interval '30 days';

comment on view public.ai_insight_recent is 'Recent AI insight executions available to scoped users.';
