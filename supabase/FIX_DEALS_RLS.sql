-- Quick fix for deals RLS policy issue
-- Run this in Supabase SQL Editor to fix the "new row violates row-level security policy" error

-- Ensure RLS is enabled
alter table public.deals enable row level security;

-- Drop and recreate the insert policy with proper checks
drop policy if exists deals_insert_agent on public.deals;

create policy deals_insert_agent on public.deals
for insert
with check (
  agent_id = auth.uid() 
  and organization_id = public.current_organization_id()
);

-- Verify the policy was created
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename = 'deals' and policyname = 'deals_insert_agent';

-- Test message
select 'Deals RLS policy fixed! Agents can now create deals.' as status;

