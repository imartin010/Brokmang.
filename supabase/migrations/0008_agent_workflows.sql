set check_function_bodies = off;
set search_path = public;

create policy deals_insert_agent on public.deals
for insert
with check (agent_id = auth.uid());

create policy deals_update_agent on public.deals
for update
using (agent_id = auth.uid())
with check (agent_id = auth.uid());

create policy deals_delete_agent on public.deals
for delete
using (agent_id = auth.uid());

create policy deal_activities_insert_agent on public.deal_activities
for insert
with check (performed_by = auth.uid());

create policy deal_activities_update_agent on public.deal_activities
for update
using (performed_by = auth.uid())
with check (performed_by = auth.uid());

create policy deal_activities_delete_agent on public.deal_activities
for delete
using (performed_by = auth.uid());




