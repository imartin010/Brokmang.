-- Fix RLS policies to allow team leaders to update supervision fields on agent profiles
-- This is needed for the Agent Supervision feature

-- Drop existing policy if it exists
drop policy if exists "Team leaders can update agent supervision" on public.profiles;

-- Allow team leaders to update supervision fields for agents in their team
create policy "Team leaders can update agent supervision"
on public.profiles
for update
using (
  exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = profiles.id
    and profiles.role = 'sales_agent'
  )
)
with check (
  exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = profiles.id
    and profiles.role = 'sales_agent'
  )
);

-- Verify the policy was created
select schemaname, tablename, policyname, cmd, qual
from pg_policies
where tablename = 'profiles'
and policyname = 'Team leaders can update agent supervision';

