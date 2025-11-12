-- Comprehensive Mock Data Seed Script for Brokmang Platform
-- This script creates realistic test data for all roles and features
-- Run this AFTER all migrations are applied and default_config.sql is run
-- 
-- Test Accounts (all passwords: testpassword123):
-- - agent1@test.com (Sales Agent)
-- - agent2@test.com (Sales Agent)
-- - agent3@test.com (Sales Agent)
-- - agent4@test.com (Sales Agent)
-- - leader1@test.com (Team Leader)
-- - leader2@test.com (Team Leader)
-- - manager1@test.com (Sales Manager)
-- - buhead1@test.com (Business Unit Head)
-- - finance1@test.com (Finance)
-- - ceo1@test.com (CEO)
-- - admin1@test.com (Admin)

set search_path = public;

-- Organization ID (should match your organization)
\set org_id '3664ed88-2563-4abf-81e3-3cf405dd7580'

-- ============================================
-- STEP 1: Create Business Units
-- ============================================

-- Business Unit 1: City Central BU
insert into public.business_units (id, organization_id, name, description)
values 
  ('11111111-1111-1111-1111-111111111111', :'org_id', 'City Central BU', 'Central business unit handling urban properties')
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- Business Unit 2: Coastal BU  
insert into public.business_units (id, organization_id, name, description)
values 
  ('22222222-2222-2222-2222-222222222222', :'org_id', 'Coastal BU', 'Coastal properties and vacation homes')
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- ============================================
-- STEP 2: Create Test Users in auth.users
-- ============================================
-- Note: In Supabase, users are created via the Auth API, not SQL
-- This script assumes users are created via the application or Supabase Auth UI
-- User IDs are placeholders - replace with actual auth.users IDs after creating users

-- User IDs (replace these with actual auth.users IDs after creating users via Auth API)
\set ceo_user_id '6fc8c806-51a2-4365-8ac5-85d82f007cc7'  -- Existing CEO user
\set admin_user_id 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set finance_user_id 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
\set buhead1_user_id 'cccccccc-cccc-cccc-cccc-cccccccccccc'
\set manager1_user_id 'dddddddd-dddd-dddd-dddd-dddddddddddd'
\set leader1_user_id 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
\set leader2_user_id 'ffffffff-ffff-ffff-ffff-ffffffffffff'
\set agent1_user_id '11111111-1111-1111-1111-111111111111'
\set agent2_user_id '22222222-2222-2222-2222-222222222222'
\set agent3_user_id '33333333-3333-3333-3333-333333333333'
\set agent4_user_id '44444444-4444-4444-4444-444444444444'

-- ============================================
-- STEP 3: Create Profiles for Test Users
-- ============================================
-- Note: These profiles reference auth.users - ensure users exist first

-- CEO (existing user)
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'ceo_user_id', :'org_id', 'CEO User', 'themartining@gmail.com', 'ceo', '{}'::jsonb)
on conflict (id) do update set role = 'ceo', full_name = excluded.full_name;

-- Admin
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'admin_user_id', :'org_id', 'Admin User', 'admin1@test.com', 'admin', '{}'::jsonb)
on conflict (id) do update set role = 'admin', full_name = excluded.full_name;

-- Finance
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'finance_user_id', :'org_id', 'Finance Manager', 'finance1@test.com', 'finance', '{}'::jsonb)
on conflict (id) do update set role = 'finance', full_name = excluded.full_name;

-- Business Unit Head 1
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'buhead1_user_id', :'org_id', 'BU Head - City Central', 'buhead1@test.com', 'business_unit_head', '{}'::jsonb)
on conflict (id) do update set role = 'business_unit_head', full_name = excluded.full_name;

-- Update BU to have leader
update public.business_units 
set leader_id = :'buhead1_user_id'
where id = '11111111-1111-1111-1111-111111111111';

-- Sales Manager 1
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'manager1_user_id', :'org_id', 'Sales Manager', 'manager1@test.com', 'sales_manager', '{}'::jsonb)
on conflict (id) do update set role = 'sales_manager', full_name = excluded.full_name;

-- Team Leader 1
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'leader1_user_id', :'org_id', 'Team Leader Alpha', 'leader1@test.com', 'team_leader', '{}'::jsonb)
on conflict (id) do update set role = 'team_leader', full_name = excluded.full_name;

-- Team Leader 2
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'leader2_user_id', :'org_id', 'Team Leader Beta', 'leader2@test.com', 'team_leader', '{}'::jsonb)
on conflict (id) do update set role = 'team_leader', full_name = excluded.full_name;

-- Agent 1
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'agent1_user_id', :'org_id', 'Sales Agent 1', 'agent1@test.com', 'sales_agent', '{}'::jsonb)
on conflict (id) do update set role = 'sales_agent', full_name = excluded.full_name;

-- Agent 2
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'agent2_user_id', :'org_id', 'Sales Agent 2', 'agent2@test.com', 'sales_agent', '{}'::jsonb)
on conflict (id) do update set role = 'sales_agent', full_name = excluded.full_name;

-- Agent 3
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'agent3_user_id', :'org_id', 'Sales Agent 3', 'agent3@test.com', 'sales_agent', '{}'::jsonb)
on conflict (id) do update set role = 'sales_agent', full_name = excluded.full_name;

-- Agent 4
insert into public.profiles (id, organization_id, full_name, email, role, metadata)
values 
  (:'agent4_user_id', :'org_id', 'Sales Agent 4', 'agent4@test.com', 'sales_agent', '{}'::jsonb)
on conflict (id) do update set role = 'sales_agent', full_name = excluded.full_name;

-- ============================================
-- STEP 4: Create Teams
-- ============================================

-- Team 1: Alpha Team (City Central BU)
insert into public.teams (id, organization_id, business_unit_id, name, leader_id, description)
values 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'org_id', '11111111-1111-1111-1111-111111111111', 'Alpha Team', :'leader1_user_id', 'Top performing team')
on conflict (id) do update set leader_id = :'leader1_user_id', name = excluded.name;

-- Team 2: Beta Team (City Central BU)
insert into public.teams (id, organization_id, business_unit_id, name, leader_id, description)
values 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'org_id', '11111111-1111-1111-1111-111111111111', 'Beta Team', :'leader2_user_id', 'Rising stars team')
on conflict (id) do update set leader_id = :'leader2_user_id', name = excluded.name;

-- ============================================
-- STEP 5: Assign Agents to Teams
-- ============================================

-- Agent 1 & 2 to Alpha Team
insert into public.team_members (team_id, user_id)
values 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'agent1_user_id'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'agent2_user_id')
on conflict (team_id, user_id) do nothing;

-- Agent 3 & 4 to Beta Team
insert into public.team_members (team_id, user_id)
values 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'agent3_user_id'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'agent4_user_id')
on conflict (team_id, user_id) do nothing;

-- ============================================
-- STEP 6: Create Deals
-- ============================================

-- Get deal source IDs
do $$
declare
  lead_source_id uuid;
  referral_source_id uuid;
  website_source_id uuid;
begin
  select id into lead_source_id from public.deal_sources where organization_id = :'org_id' and name = 'Lead' limit 1;
  select id into referral_source_id from public.deal_sources where organization_id = :'org_id' and name = 'Referral' limit 1;
  select id into website_source_id from public.deal_sources where organization_id = :'org_id' and name = 'Website' limit 1;

  -- Agent 1 Deals
  insert into public.deals (organization_id, business_unit_id, team_id, agent_id, source_id, name, stage, deal_value, commission_value, probability, expected_close_date, notes)
  values 
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'agent1_user_id', lead_source_id, 'Luxury Apartment - Downtown', 'won', 5000000, 30000, 100, current_date - interval '5 days', 'Closed successfully'),
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'agent1_user_id', referral_source_id, 'Villa - New Cairo', 'negotiation', 8000000, 48000, 75, current_date + interval '15 days', 'In final negotiations'),
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'agent1_user_id', website_source_id, 'Penthouse - Zamalek', 'qualified', 12000000, 72000, 60, current_date + interval '30 days', 'Qualified lead')
  on conflict do nothing;

  -- Agent 2 Deals
  insert into public.deals (organization_id, business_unit_id, team_id, agent_id, source_id, name, stage, deal_value, commission_value, probability, expected_close_date, notes)
  values 
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'agent2_user_id', lead_source_id, 'Townhouse - Maadi', 'won', 3500000, 21000, 100, current_date - interval '10 days', 'Closed deal'),
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'agent2_user_id', referral_source_id, 'Duplex - Heliopolis', 'contract_sent', 6000000, 36000, 90, current_date + interval '7 days', 'Contract sent, awaiting signature'),
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'agent2_user_id', website_source_id, 'Apartment - Nasr City', 'prospecting', 2000000, 12000, 30, current_date + interval '45 days', 'New prospect')
  on conflict do nothing;

  -- Agent 3 Deals
  insert into public.deals (organization_id, business_unit_id, team_id, agent_id, source_id, name, stage, deal_value, commission_value, probability, expected_close_date, notes)
  values 
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'agent3_user_id', lead_source_id, 'Beach Villa - North Coast', 'won', 15000000, 90000, 100, current_date - interval '3 days', 'High value deal closed'),
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'agent3_user_id', referral_source_id, 'Resort Unit - Sharm El Sheikh', 'qualified', 4000000, 24000, 50, current_date + interval '20 days', 'Qualified vacation property')
  on conflict do nothing;

  -- Agent 4 Deals
  insert into public.deals (organization_id, business_unit_id, team_id, agent_id, source_id, name, stage, deal_value, commission_value, probability, expected_close_date, notes)
  values 
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'agent4_user_id', lead_source_id, 'Studio - New Capital', 'negotiation', 1500000, 9000, 70, current_date + interval '10 days', 'Affordable housing project'),
    (:'org_id', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'agent4_user_id', website_source_id, 'Commercial Space - 6th October', 'prospecting', 8000000, 48000, 25, current_date + interval '60 days', 'Commercial property inquiry')
  on conflict do nothing;
end $$;

-- ============================================
-- STEP 7: Create Leads
-- ============================================

do $$
declare
  lead_source_id uuid;
begin
  select id into lead_source_id from public.deal_sources where organization_id = :'org_id' and name = 'Lead' limit 1;

  -- Agent 1 Leads
  insert into public.leads (organization_id, agent_id, team_id, source_id, client_name, client_phone, client_email, destination, estimated_budget, project_type, status, received_date, notes)
  values 
    (:'org_id', :'agent1_user_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', lead_source_id, 'Ahmed Mohamed', '+201234567890', 'ahmed@example.com', 'New Cairo', 5000000, 'Villa', 'qualified', current_date - interval '5 days', 'Interested in villa with garden'),
    (:'org_id', :'agent1_user_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', lead_source_id, 'Sara Ali', '+201234567891', 'sara@example.com', 'Maadi', 3000000, 'Apartment', 'contacted', current_date - interval '2 days', 'Following up')
  on conflict do nothing;

  -- Agent 2 Leads
  insert into public.leads (organization_id, agent_id, team_id, source_id, client_name, client_phone, client_email, destination, estimated_budget, project_type, status, received_date, notes)
  values 
    (:'org_id', :'agent2_user_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', lead_source_id, 'Mohamed Hassan', '+201234567892', 'mohamed@example.com', 'Heliopolis', 4000000, 'Duplex', 'new', current_date, 'New lead from website'),
    (:'org_id', :'agent2_user_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', lead_source_id, 'Fatima Ibrahim', '+201234567893', 'fatima@example.com', 'Zamalek', 6000000, 'Penthouse', 'qualified', current_date - interval '7 days', 'High priority lead')
  on conflict do nothing;

  -- Agent 3 Leads
  insert into public.leads (organization_id, agent_id, team_id, source_id, client_name, client_phone, client_email, destination, estimated_budget, project_type, status, received_date, notes)
  values 
    (:'org_id', :'agent3_user_id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', lead_source_id, 'Omar Khaled', '+201234567894', 'omar@example.com', 'North Coast', 12000000, 'Beach Villa', 'contacted', current_date - interval '3 days', 'Vacation home inquiry'),
    (:'org_id', :'agent3_user_id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', lead_source_id, 'Layla Mahmoud', '+201234567895', 'layla@example.com', 'Sharm El Sheikh', 3500000, 'Resort Unit', 'new', current_date - interval '1 day', 'New coastal property lead')
  on conflict do nothing;

  -- Agent 4 Leads
  insert into public.leads (organization_id, agent_id, team_id, source_id, client_name, client_phone, client_email, destination, estimated_budget, project_type, status, received_date, notes)
  values 
    (:'org_id', :'agent4_user_id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', lead_source_id, 'Youssef Farid', '+201234567896', 'youssef@example.com', 'New Capital', 1500000, 'Studio', 'qualified', current_date - interval '4 days', 'Budget-conscious buyer'),
    (:'org_id', :'agent4_user_id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', lead_source_id, 'Nour Tarek', '+201234567897', 'nour@example.com', '6th October', 8000000, 'Commercial', 'new', current_date, 'Commercial property inquiry')
  on conflict do nothing;
end $$;

-- ============================================
-- STEP 8: Create Client Requests
-- ============================================

-- Agent 1 Requests
insert into public.client_requests (organization_id, agent_id, team_id, team_leader_id, client_name, client_phone, client_email, destination, client_budget, project_needed, status, delivery_date, agent_notes, created_at)
values 
  (:'org_id', :'agent1_user_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'leader1_user_id', 'Khalid Mostafa', '+201234567898', 'khalid@example.com', 'New Cairo', 7000000, 'Villa with Pool', 'approved', current_date + interval '90 days', 'Client wants villa with private pool', current_date - interval '10 days'),
  (:'org_id', :'agent1_user_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'leader1_user_id', 'Mona Samir', '+201234567899', 'mona@example.com', 'Maadi', 2500000, '2BR Apartment', 'pending', current_date + interval '60 days', 'First-time buyer', current_date - interval '2 days')
on conflict do nothing;

-- Agent 2 Requests
insert into public.client_requests (organization_id, agent_id, team_id, team_leader_id, client_name, client_phone, client_email, destination, client_budget, project_needed, status, delivery_date, agent_notes, created_at)
values 
  (:'org_id', :'agent2_user_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'leader1_user_id', 'Tamer Waleed', '+201234567900', 'tamer@example.com', 'Heliopolis', 5000000, 'Townhouse', 'approved', current_date + interval '120 days', 'Family home requirement', current_date - interval '8 days'),
  (:'org_id', :'agent2_user_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', :'leader1_user_id', 'Rania Fahmy', '+201234567901', 'rania@example.com', 'Zamalek', 10000000, 'Penthouse', 'rejected', null, 'Budget too high for current market', current_date - interval '15 days')
on conflict do nothing;

-- Agent 3 Requests
insert into public.client_requests (organization_id, agent_id, team_id, team_leader_id, client_name, client_phone, client_email, destination, client_budget, project_needed, status, delivery_date, agent_notes, created_at)
values 
  (:'org_id', :'agent3_user_id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'leader2_user_id', 'Amr Saber', '+201234567902', 'amr@example.com', 'North Coast', 10000000, 'Beachfront Villa', 'approved', current_date + interval '180 days', 'Luxury vacation home', current_date - interval '12 days')
on conflict do nothing;

-- Agent 4 Requests
insert into public.client_requests (organization_id, agent_id, team_id, team_leader_id, client_name, client_phone, client_email, destination, client_budget, project_needed, status, delivery_date, agent_notes, created_at)
values 
  (:'org_id', :'agent4_user_id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', :'leader2_user_id', 'Dina Magdy', '+201234567903', 'dina@example.com', 'New Capital', 1800000, '1BR Apartment', 'pending', current_date + interval '45 days', 'Affordable housing', current_date - interval '5 days')
on conflict do nothing;

-- ============================================
-- STEP 9: Create Meetings
-- ============================================

-- Get some deal IDs for meetings
do $$
declare
  deal1_id uuid;
  deal2_id uuid;
  request1_id uuid;
begin
  select id into deal1_id from public.deals where agent_id = :'agent1_user_id' and stage = 'negotiation' limit 1;
  select id into deal2_id from public.deals where agent_id = :'agent2_user_id' and stage = 'contract_sent' limit 1;
  select id into request1_id from public.client_requests where agent_id = :'agent1_user_id' and status = 'approved' limit 1;

  -- Upcoming meetings
  insert into public.meetings (organization_id, agent_id, deal_id, client_request_id, title, description, meeting_date, meeting_time, duration_minutes, location, status, attendees)
  values 
    (:'org_id', :'agent1_user_id', deal1_id, null, 'Property Viewing - Villa New Cairo', 'Site visit for villa property', current_date + interval '2 days', '10:00', 120, 'New Cairo Development', 'scheduled', '["Ahmed Mohamed", "Property Manager"]'::jsonb),
    (:'org_id', :'agent2_user_id', deal2_id, null, 'Contract Signing', 'Final contract signing meeting', current_date + interval '1 day', '14:00', 60, 'Office', 'scheduled', '["Tamer Waleed", "Legal Advisor"]'::jsonb),
    (:'org_id', :'agent1_user_id', null, request1_id, 'Initial Consultation', 'Discuss client requirements', current_date + interval '3 days', '11:00', 90, 'Client Office', 'scheduled', '["Khalid Mostafa"]'::jsonb),
    (:'org_id', :'agent3_user_id', null, null, 'Beach Property Tour', 'Tour of beachfront properties', current_date + interval '5 days', '09:00', 180, 'North Coast', 'scheduled', '["Amr Saber"]'::jsonb)
  on conflict do nothing;

  -- Completed meetings
  insert into public.meetings (organization_id, agent_id, deal_id, client_request_id, title, description, meeting_date, meeting_time, duration_minutes, location, status, outcome, attendees)
  values 
    (:'org_id', :'agent1_user_id', null, null, 'Initial Client Meeting', 'Met with potential client', current_date - interval '7 days', '15:00', 60, 'Coffee Shop', 'completed', 'Client interested, follow-up scheduled', '["Ahmed Mohamed"]'::jsonb),
    (:'org_id', :'agent2_user_id', null, null, 'Property Presentation', 'Presented townhouse options', current_date - interval '5 days', '16:00', 90, 'Office', 'completed', 'Client selected preferred unit', '["Tamer Waleed"]'::jsonb)
  on conflict do nothing;
end $$;

-- ============================================
-- STEP 10: Create Attendance Logs (Last 14 Days)
-- ============================================

do $$
declare
  work_date date;
begin
  -- Generate attendance for last 14 days for all agents
  for i in 0..13 loop
    work_date := current_date - (i || ' days')::interval;
    
    -- Skip weekends (Saturday = 6, Sunday = 0)
    if extract(dow from work_date) not in (0, 6) then
      -- Agent 1
      insert into public.attendance_logs (organization_id, agent_id, check_in_time, check_out_time, work_date, location_check_in, location_check_out)
      values 
        (:'org_id', :'agent1_user_id', work_date + interval '9 hours', work_date + interval '17 hours', work_date, 'Office', 'Office')
      on conflict (agent_id, work_date) do nothing;

      -- Agent 2
      insert into public.attendance_logs (organization_id, agent_id, check_in_time, check_out_time, work_date, location_check_in, location_check_out)
      values 
        (:'org_id', :'agent2_user_id', work_date + interval '9 hours 30 minutes', work_date + interval '17 hours 30 minutes', work_date, 'Office', 'Office')
      on conflict (agent_id, work_date) do nothing;

      -- Agent 3
      insert into public.attendance_logs (organization_id, agent_id, check_in_time, check_out_time, work_date, location_check_in, location_check_out)
      values 
        (:'org_id', :'agent3_user_id', work_date + interval '8 hours 45 minutes', work_date + interval '16 hours 45 minutes', work_date, 'Field', 'Field')
      on conflict (agent_id, work_date) do nothing;

      -- Agent 4
      insert into public.attendance_logs (organization_id, agent_id, check_in_time, check_out_time, work_date, location_check_in, location_check_out)
      values 
        (:'org_id', :'agent4_user_id', work_date + interval '10 hours', work_date + interval '18 hours', work_date, 'Office', 'Office')
      on conflict (agent_id, work_date) do nothing;
    end if;
  end loop;
end $$;

-- ============================================
-- STEP 11: Create Daily Agent Metrics (Last 7 Days)
-- ============================================

do $$
declare
  work_date date;
begin
  for i in 0..6 loop
    work_date := current_date - (i || ' days')::interval;
    
    -- Skip weekends
    if extract(dow from work_date) not in (0, 6) then
      -- Agent 1 Metrics
      insert into public.daily_agent_metrics (organization_id, agent_id, work_date, active_calls_count, meetings_scheduled, requests_generated, deals_closed, mood, notes)
      values 
        (:'org_id', :'agent1_user_id', work_date, 15 + (i * 2), 2, 1, case when i = 0 then 1 else 0 end, 'great', 'Productive day')
      on conflict (agent_id, work_date) do nothing;

      -- Agent 2 Metrics
      insert into public.daily_agent_metrics (organization_id, agent_id, work_date, active_calls_count, meetings_scheduled, requests_generated, deals_closed, mood, notes)
      values 
        (:'org_id', :'agent2_user_id', work_date, 12 + (i * 1), 1, 0, case when i = 1 then 1 else 0 end, 'good', 'Steady progress')
      on conflict (agent_id, work_date) do nothing;

      -- Agent 3 Metrics
      insert into public.daily_agent_metrics (organization_id, agent_id, work_date, active_calls_count, meetings_scheduled, requests_generated, deals_closed, mood, notes)
      values 
        (:'org_id', :'agent3_user_id', work_date, 20 + (i * 3), 3, 2, case when i = 2 then 1 else 0 end, 'great', 'High activity day')
      on conflict (agent_id, work_date) do nothing;

      -- Agent 4 Metrics
      insert into public.daily_agent_metrics (organization_id, agent_id, work_date, active_calls_count, meetings_scheduled, requests_generated, deals_closed, mood, notes)
      values 
        (:'org_id', :'agent4_user_id', work_date, 10 + i, 1, 1, 0, 'okay', 'Working on leads')
      on conflict (agent_id, work_date) do nothing;
    end if;
  end loop;
end $$;

-- ============================================
-- STEP 12: Create Agent Ratings (Last 7 Days)
-- ============================================

do $$
declare
  work_date date;
begin
  for i in 0..6 loop
    work_date := current_date - (i || ' days')::interval;
    
    -- Skip weekends
    if extract(dow from work_date) not in (0, 6) then
      -- Leader 1 ratings for Agent 1
      insert into public.agent_daily_ratings (organization_id, agent_id, rated_by, rating_date, appearance_rating, behavior_rating, performance_rating, leads_received_count, deals_closed_count, comments)
      values 
        (:'org_id', :'agent1_user_id', :'leader1_user_id', work_date, 5, 5, 5, 2, case when i = 0 then 1 else 0 end, 'Excellent performance')
      on conflict (agent_id, rated_by, rating_date) do nothing;

      -- Leader 1 ratings for Agent 2
      insert into public.agent_daily_ratings (organization_id, agent_id, rated_by, rating_date, appearance_rating, behavior_rating, performance_rating, leads_received_count, deals_closed_count, comments)
      values 
        (:'org_id', :'agent2_user_id', :'leader1_user_id', work_date, 4, 4, 4, 1, case when i = 1 then 1 else 0 end, 'Good work, keep it up')
      on conflict (agent_id, rated_by, rating_date) do nothing;

      -- Leader 2 ratings for Agent 3
      insert into public.agent_daily_ratings (organization_id, agent_id, rated_by, rating_date, appearance_rating, behavior_rating, performance_rating, leads_received_count, deals_closed_count, comments)
      values 
        (:'org_id', :'agent3_user_id', :'leader2_user_id', work_date, 5, 5, 5, 3, case when i = 2 then 1 else 0 end, 'Outstanding results')
      on conflict (agent_id, rated_by, rating_date) do nothing;

      -- Leader 2 ratings for Agent 4
      insert into public.agent_daily_ratings (organization_id, agent_id, rated_by, rating_date, appearance_rating, behavior_rating, performance_rating, leads_received_count, deals_closed_count, comments)
      values 
        (:'org_id', :'agent4_user_id', :'leader2_user_id', work_date, 4, 4, 3, 1, 0, 'Improving, need more deals')
      on conflict (agent_id, rated_by, rating_date) do nothing;
    end if;
  end loop;
end $$;

-- ============================================
-- STEP 13: Create Cost Entries
-- ============================================

-- Fixed Costs
insert into public.cost_entries (organization_id, business_unit_id, cost_type, category, amount, currency, cost_date, description, approval_status, created_by)
values 
  (:'org_id', '11111111-1111-1111-1111-111111111111', 'fixed', 'rent', 50000, 'EGP', current_date - interval '1 month', 'Office rent for City Central BU', 'approved', :'finance_user_id'),
  (:'org_id', '11111111-1111-1111-1111-111111111111', 'fixed', 'utilities', 15000, 'EGP', current_date - interval '1 month', 'Electricity, water, internet', 'approved', :'finance_user_id'),
  (:'org_id', '11111111-1111-1111-1111-111111111111', 'fixed', 'insurance', 10000, 'EGP', current_date - interval '1 month', 'Business insurance', 'approved', :'finance_user_id'),
  (:'org_id', null, 'fixed', 'software', 20000, 'EGP', current_date - interval '1 month', 'CRM and software subscriptions', 'approved', :'finance_user_id')
on conflict do nothing;

-- Variable Costs
insert into public.cost_entries (organization_id, business_unit_id, cost_type, category, amount, currency, cost_date, description, approval_status, created_by)
values 
  (:'org_id', '11111111-1111-1111-1111-111111111111', 'variable', 'marketing', 30000, 'EGP', current_date - interval '15 days', 'Digital marketing campaign', 'approved', :'finance_user_id'),
  (:'org_id', '11111111-1111-1111-1111-111111111111', 'variable', 'travel', 15000, 'EGP', current_date - interval '10 days', 'Agent travel expenses', 'approved', :'finance_user_id'),
  (:'org_id', '11111111-1111-1111-1111-111111111111', 'variable', 'phone', 8000, 'EGP', current_date - interval '5 days', 'Phone and communication costs', 'approved', :'finance_user_id'),
  (:'org_id', '11111111-1111-1111-1111-111111111111', 'variable', 'events', 25000, 'EGP', current_date - interval '20 days', 'Networking event sponsorship', 'approved', :'finance_user_id')
on conflict do nothing;

-- ============================================
-- STEP 14: Create Employee Salaries
-- ============================================

insert into public.employee_salaries (organization_id, employee_id, monthly_salary, currency, effective_from, notes, created_by)
values 
  (:'org_id', :'agent1_user_id', 8000, 'EGP', current_date - interval '3 months', 'Base salary for Sales Agent 1', :'finance_user_id'),
  (:'org_id', :'agent2_user_id', 8000, 'EGP', current_date - interval '3 months', 'Base salary for Sales Agent 2', :'finance_user_id'),
  (:'org_id', :'agent3_user_id', 8500, 'EGP', current_date - interval '3 months', 'Base salary for Sales Agent 3', :'finance_user_id'),
  (:'org_id', :'agent4_user_id', 7500, 'EGP', current_date - interval '3 months', 'Base salary for Sales Agent 4', :'finance_user_id'),
  (:'org_id', :'leader1_user_id', 12000, 'EGP', current_date - interval '3 months', 'Base salary for Team Leader 1', :'finance_user_id'),
  (:'org_id', :'leader2_user_id', 12000, 'EGP', current_date - interval '3 months', 'Base salary for Team Leader 2', :'finance_user_id'),
  (:'org_id', :'manager1_user_id', 15000, 'EGP', current_date - interval '3 months', 'Base salary for Sales Manager', :'finance_user_id'),
  (:'org_id', :'buhead1_user_id', 20000, 'EGP', current_date - interval '3 months', 'Base salary for BU Head', :'finance_user_id'),
  (:'org_id', :'finance_user_id', 18000, 'EGP', current_date - interval '3 months', 'Base salary for Finance Manager', :'finance_user_id')
on conflict do nothing;

-- ============================================
-- STEP 15: Create Deal Activities
-- ============================================

do $$
declare
  deal1_id uuid;
  deal2_id uuid;
begin
  select id into deal1_id from public.deals where agent_id = :'agent1_user_id' and stage = 'negotiation' limit 1;
  select id into deal2_id from public.deals where agent_id = :'agent2_user_id' and stage = 'contract_sent' limit 1;

  -- Deal 1 Activities
  insert into public.deal_activities (deal_id, performed_by, activity_type, summary, activity_at)
  values 
    (deal1_id, :'agent1_user_id', 'call', 'Initial client call - discussed requirements', current_date - interval '10 days'),
    (deal1_id, :'agent1_user_id', 'meeting', 'Property viewing scheduled', current_date - interval '5 days'),
    (deal1_id, :'agent1_user_id', 'email', 'Sent property details and pricing', current_date - interval '3 days'),
    (deal1_id, :'agent1_user_id', 'negotiation', 'Price negotiation in progress', current_date - interval '1 day')
  on conflict do nothing;

  -- Deal 2 Activities
  insert into public.deal_activities (deal_id, performed_by, activity_type, summary, activity_at)
  values 
    (deal2_id, :'agent2_user_id', 'call', 'First contact with client', current_date - interval '12 days'),
    (deal2_id, :'agent2_user_id', 'meeting', 'Property presentation meeting', current_date - interval '8 days'),
    (deal2_id, :'agent2_user_id', 'email', 'Sent contract documents', current_date - interval '2 days'),
    (deal2_id, :'agent2_user_id', 'follow-up', 'Contract signing scheduled', current_date)
  on conflict do nothing;
end $$;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

do $$
begin
  raise notice 'Mock data seed completed successfully!';
  raise notice 'Remember to:';
  raise notice '1. Create users in Supabase Auth with the emails above';
  raise notice '2. Update the user IDs in this script to match the actual auth.users IDs';
  raise notice '3. Run this script again to link profiles to the correct users';
  raise notice '4. All test account passwords should be: testpassword123';
end $$;

