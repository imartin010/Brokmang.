-- Fix deals RLS policy to include organization_id check
-- This ensures agents can only create deals in their own organization

set check_function_bodies = off;
set search_path = public;

-- Ensure RLS is enabled on deals table
alter table public.deals enable row level security;

-- Drop existing policy if it exists
drop policy if exists deals_insert_agent on public.deals;

-- Recreate policy with organization_id check
-- Note: This policy allows agents to create deals where:
-- 1. They are the agent (agent_id = auth.uid())
-- 2. The deal belongs to their organization (organization_id matches their profile's organization_id)
create policy deals_insert_agent on public.deals
for insert
with check (
  agent_id = auth.uid() 
  and organization_id = public.current_organization_id()
);

-- Also update the update policy to include organization_id check for consistency
drop policy if exists deals_update_agent on public.deals;

create policy deals_update_agent on public.deals
for update
using (
  agent_id = auth.uid() 
  and organization_id = public.current_organization_id()
)
with check (
  agent_id = auth.uid() 
  and organization_id = public.current_organization_id()
);

-- Also update the delete policy for consistency
drop policy if exists deals_delete_agent on public.deals;

create policy deals_delete_agent on public.deals
for delete
using (
  agent_id = auth.uid() 
  and organization_id = public.current_organization_id()
);

comment on policy deals_insert_agent on public.deals is 'RLS policy: Agents can create deals for themselves in their organization.';
comment on policy deals_update_agent on public.deals is 'RLS policy: Agents can update their own deals in their organization.';
comment on policy deals_delete_agent on public.deals is 'RLS policy: Agents can delete their own deals in their organization.';

