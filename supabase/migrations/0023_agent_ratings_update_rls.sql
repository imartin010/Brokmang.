drop policy if exists "Team leaders can update ratings" on public.agent_daily_ratings;

create policy "Team leaders can update ratings"
on public.agent_daily_ratings
for update
using (
  rated_by = auth.uid()
  and exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = agent_daily_ratings.agent_id
  )
)
with check (
  rated_by = auth.uid()
  and exists (
    select 1 from public.teams t
    join public.team_members tm on tm.team_id = t.id
    where t.leader_id = auth.uid()
    and tm.user_id = agent_daily_ratings.agent_id
  )
);
