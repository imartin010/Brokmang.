-- Comprehensive Mock Data Seed Script for Brokmang Platform
-- This script creates realistic test data for all roles and features
-- Run this in Supabase SQL Editor AFTER all migrations are applied and default_config.sql is run
-- 
-- IMPORTANT: Before running this script:
-- 1. Create users in Supabase Auth Dashboard with these emails
-- 2. Copy the user IDs from auth.users table
-- 3. Replace the placeholder user IDs in this script with actual IDs
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

-- ============================================
-- CONFIGURATION: Set your organization ID here
-- ============================================
-- Replace this with your actual organization ID
DO $$
DECLARE
  org_id uuid := '3664ed88-2563-4abf-81e3-3cf405dd7580';
  
  -- User IDs - REPLACE THESE with actual auth.users IDs after creating users
  ceo_user_id uuid := '6fc8c806-51a2-4365-8ac5-85d82f007cc7';  -- Existing CEO (themartining@gmail.com)
  admin_user_id uuid;
  finance_user_id uuid;
  buhead1_user_id uuid;
  manager1_user_id uuid;
  leader1_user_id uuid;
  leader2_user_id uuid;
  agent1_user_id uuid;
  agent2_user_id uuid;
  agent3_user_id uuid;
  agent4_user_id uuid;
  
  -- Deal source IDs
  lead_source_id uuid;
  referral_source_id uuid;
  website_source_id uuid;
  
  -- Team and BU IDs
  bu1_id uuid := '11111111-1111-1111-1111-111111111111';
  team1_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  team2_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  
  -- Temporary variables for meetings and activities
  deal1_id uuid;
  deal2_id uuid;
  request1_id uuid;
  
  -- Variables for loops
  loop_work_date date;
  day_offset int;
BEGIN
  -- ============================================
  -- STEP 1: Get user IDs from auth.users by email
  -- ============================================
  -- This will populate user IDs if users exist in auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin1@test.com';
  SELECT id INTO finance_user_id FROM auth.users WHERE email = 'finance1@test.com';
  SELECT id INTO buhead1_user_id FROM auth.users WHERE email = 'buhead1@test.com';
  SELECT id INTO manager1_user_id FROM auth.users WHERE email = 'manager1@test.com';
  SELECT id INTO leader1_user_id FROM auth.users WHERE email = 'leader1@test.com';
  SELECT id INTO leader2_user_id FROM auth.users WHERE email = 'leader2@test.com';
  SELECT id INTO agent1_user_id FROM auth.users WHERE email = 'agent1@test.com';
  SELECT id INTO agent2_user_id FROM auth.users WHERE email = 'agent2@test.com';
  SELECT id INTO agent3_user_id FROM auth.users WHERE email = 'agent3@test.com';
  SELECT id INTO agent4_user_id FROM auth.users WHERE email = 'agent4@test.com';

  -- ============================================
  -- STEP 2: Create Business Units
  -- ============================================
  INSERT INTO public.business_units (id, organization_id, name, description)
  VALUES 
    (bu1_id, org_id, 'City Central BU', 'Central business unit handling urban properties')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

  INSERT INTO public.business_units (id, organization_id, name, description)
  VALUES 
    ('22222222-2222-2222-2222-222222222222', org_id, 'Coastal BU', 'Coastal properties and vacation homes')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

  -- ============================================
  -- STEP 3: Create/Update Profiles (only if users exist)
  -- ============================================
  
  -- CEO (existing)
  IF ceo_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (ceo_user_id, org_id, 'CEO User', 'themartining@gmail.com', 'ceo', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'ceo', full_name = EXCLUDED.full_name;
  END IF;

  -- Admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (admin_user_id, org_id, 'Admin User', 'admin1@test.com', 'admin', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = EXCLUDED.full_name;
  END IF;

  -- Finance
  IF finance_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (finance_user_id, org_id, 'Finance Manager', 'finance1@test.com', 'finance', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'finance', full_name = EXCLUDED.full_name;
  END IF;

  -- Business Unit Head 1
  IF buhead1_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (buhead1_user_id, org_id, 'BU Head - City Central', 'buhead1@test.com', 'business_unit_head', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'business_unit_head', full_name = EXCLUDED.full_name;

    UPDATE public.business_units 
    SET leader_id = buhead1_user_id
    WHERE id = bu1_id;
  END IF;

  -- Sales Manager 1
  IF manager1_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (manager1_user_id, org_id, 'Sales Manager', 'manager1@test.com', 'sales_manager', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'sales_manager', full_name = EXCLUDED.full_name;
  END IF;

  -- Team Leader 1
  IF leader1_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (leader1_user_id, org_id, 'Team Leader Alpha', 'leader1@test.com', 'team_leader', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'team_leader', full_name = EXCLUDED.full_name;
  END IF;

  -- Team Leader 2
  IF leader2_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (leader2_user_id, org_id, 'Team Leader Beta', 'leader2@test.com', 'team_leader', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'team_leader', full_name = EXCLUDED.full_name;
  END IF;

  -- Agents
  IF agent1_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (agent1_user_id, org_id, 'Sales Agent 1', 'agent1@test.com', 'sales_agent', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'sales_agent', full_name = EXCLUDED.full_name;
  END IF;

  IF agent2_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (agent2_user_id, org_id, 'Sales Agent 2', 'agent2@test.com', 'sales_agent', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'sales_agent', full_name = EXCLUDED.full_name;
  END IF;

  IF agent3_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (agent3_user_id, org_id, 'Sales Agent 3', 'agent3@test.com', 'sales_agent', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'sales_agent', full_name = EXCLUDED.full_name;
  END IF;

  IF agent4_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, organization_id, full_name, email, role, metadata)
    VALUES (agent4_user_id, org_id, 'Sales Agent 4', 'agent4@test.com', 'sales_agent', '{}'::jsonb)
    ON CONFLICT (id) DO UPDATE SET role = 'sales_agent', full_name = EXCLUDED.full_name;
  END IF;

  -- ============================================
  -- STEP 4: Create Teams
  -- ============================================
  IF leader1_user_id IS NOT NULL THEN
    -- Insert or update team (using DO NOTHING since we're using fixed IDs)
    INSERT INTO public.teams (id, business_unit_id, name, leader_id)
    VALUES (team1_id, bu1_id, 'Alpha Team', leader1_user_id)
    ON CONFLICT (id) DO UPDATE SET leader_id = leader1_user_id, name = EXCLUDED.name, business_unit_id = EXCLUDED.business_unit_id;
  END IF;

  IF leader2_user_id IS NOT NULL THEN
    -- Insert or update team (using DO NOTHING since we're using fixed IDs)
    INSERT INTO public.teams (id, business_unit_id, name, leader_id)
    VALUES (team2_id, bu1_id, 'Beta Team', leader2_user_id)
    ON CONFLICT (id) DO UPDATE SET leader_id = leader2_user_id, name = EXCLUDED.name, business_unit_id = EXCLUDED.business_unit_id;
  END IF;

  -- ============================================
  -- STEP 5: Assign Agents to Teams
  -- ============================================
  IF agent1_user_id IS NOT NULL AND leader1_user_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id)
    VALUES (team1_id, agent1_user_id)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  IF agent2_user_id IS NOT NULL AND leader1_user_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id)
    VALUES (team1_id, agent2_user_id)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  IF agent3_user_id IS NOT NULL AND leader2_user_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id)
    VALUES (team2_id, agent3_user_id)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  IF agent4_user_id IS NOT NULL AND leader2_user_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id)
    VALUES (team2_id, agent4_user_id)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  -- ============================================
  -- STEP 6: Get Deal Source IDs
  -- ============================================
  SELECT id INTO lead_source_id FROM public.deal_sources WHERE organization_id = org_id AND name = 'Lead' LIMIT 1;
  SELECT id INTO referral_source_id FROM public.deal_sources WHERE organization_id = org_id AND name = 'Referral' LIMIT 1;
  SELECT id INTO website_source_id FROM public.deal_sources WHERE organization_id = org_id AND name = 'Website' LIMIT 1;

  -- ============================================
  -- STEP 7: Create Deals (only if agents exist)
  -- ============================================
  IF agent1_user_id IS NOT NULL THEN
    INSERT INTO public.deals (organization_id, business_unit_id, team_id, agent_id, source_id, name, stage, deal_value, commission_value, probability, expected_close_date, notes)
    VALUES 
      (org_id, bu1_id, team1_id, agent1_user_id, lead_source_id, 'Luxury Apartment - Downtown', 'won', 5000000, 30000, 100, CURRENT_DATE - INTERVAL '5 days', 'Closed successfully'),
      (org_id, bu1_id, team1_id, agent1_user_id, referral_source_id, 'Villa - New Cairo', 'negotiation', 8000000, 48000, 75, CURRENT_DATE + INTERVAL '15 days', 'In final negotiations'),
      (org_id, bu1_id, team1_id, agent1_user_id, website_source_id, 'Penthouse - Zamalek', 'qualified', 12000000, 72000, 60, CURRENT_DATE + INTERVAL '30 days', 'Qualified lead')
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent2_user_id IS NOT NULL THEN
    INSERT INTO public.deals (organization_id, business_unit_id, team_id, agent_id, source_id, name, stage, deal_value, commission_value, probability, expected_close_date, notes)
    VALUES 
      (org_id, bu1_id, team1_id, agent2_user_id, lead_source_id, 'Townhouse - Maadi', 'won', 3500000, 21000, 100, CURRENT_DATE - INTERVAL '10 days', 'Closed deal'),
      (org_id, bu1_id, team1_id, agent2_user_id, referral_source_id, 'Duplex - Heliopolis', 'contract_sent', 6000000, 36000, 90, CURRENT_DATE + INTERVAL '7 days', 'Contract sent, awaiting signature'),
      (org_id, bu1_id, team1_id, agent2_user_id, website_source_id, 'Apartment - Nasr City', 'prospecting', 2000000, 12000, 30, CURRENT_DATE + INTERVAL '45 days', 'New prospect')
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent3_user_id IS NOT NULL THEN
    INSERT INTO public.deals (organization_id, business_unit_id, team_id, agent_id, source_id, name, stage, deal_value, commission_value, probability, expected_close_date, notes)
    VALUES 
      (org_id, bu1_id, team2_id, agent3_user_id, lead_source_id, 'Beach Villa - North Coast', 'won', 15000000, 90000, 100, CURRENT_DATE - INTERVAL '3 days', 'High value deal closed'),
      (org_id, bu1_id, team2_id, agent3_user_id, referral_source_id, 'Resort Unit - Sharm El Sheikh', 'qualified', 4000000, 24000, 50, CURRENT_DATE + INTERVAL '20 days', 'Qualified vacation property')
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent4_user_id IS NOT NULL THEN
    INSERT INTO public.deals (organization_id, business_unit_id, team_id, agent_id, source_id, name, stage, deal_value, commission_value, probability, expected_close_date, notes)
    VALUES 
      (org_id, bu1_id, team2_id, agent4_user_id, lead_source_id, 'Studio - New Capital', 'negotiation', 1500000, 9000, 70, CURRENT_DATE + INTERVAL '10 days', 'Affordable housing project'),
      (org_id, bu1_id, team2_id, agent4_user_id, website_source_id, 'Commercial Space - 6th October', 'prospecting', 8000000, 48000, 25, CURRENT_DATE + INTERVAL '60 days', 'Commercial property inquiry')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- STEP 8: Create Leads
  -- ============================================
  IF agent1_user_id IS NOT NULL THEN
    INSERT INTO public.leads (organization_id, agent_id, team_id, source_id, client_name, client_phone, client_email, destination, estimated_budget, project_type, status, received_date, notes)
    VALUES 
      (org_id, agent1_user_id, team1_id, lead_source_id, 'Ahmed Mohamed', '+201234567890', 'ahmed@example.com', 'New Cairo', 5000000, 'Villa', 'qualified', CURRENT_DATE - INTERVAL '5 days', 'Interested in villa with garden'),
      (org_id, agent1_user_id, team1_id, lead_source_id, 'Sara Ali', '+201234567891', 'sara@example.com', 'Maadi', 3000000, 'Apartment', 'contacted', CURRENT_DATE - INTERVAL '2 days', 'Following up')
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent2_user_id IS NOT NULL THEN
    INSERT INTO public.leads (organization_id, agent_id, team_id, source_id, client_name, client_phone, client_email, destination, estimated_budget, project_type, status, received_date, notes)
    VALUES 
      (org_id, agent2_user_id, team1_id, lead_source_id, 'Mohamed Hassan', '+201234567892', 'mohamed@example.com', 'Heliopolis', 4000000, 'Duplex', 'new', CURRENT_DATE, 'New lead from website'),
      (org_id, agent2_user_id, team1_id, lead_source_id, 'Fatima Ibrahim', '+201234567893', 'fatima@example.com', 'Zamalek', 6000000, 'Penthouse', 'qualified', CURRENT_DATE - INTERVAL '7 days', 'High priority lead')
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent3_user_id IS NOT NULL THEN
    INSERT INTO public.leads (organization_id, agent_id, team_id, source_id, client_name, client_phone, client_email, destination, estimated_budget, project_type, status, received_date, notes)
    VALUES 
      (org_id, agent3_user_id, team2_id, lead_source_id, 'Omar Khaled', '+201234567894', 'omar@example.com', 'North Coast', 12000000, 'Beach Villa', 'contacted', CURRENT_DATE - INTERVAL '3 days', 'Vacation home inquiry'),
      (org_id, agent3_user_id, team2_id, lead_source_id, 'Layla Mahmoud', '+201234567895', 'layla@example.com', 'Sharm El Sheikh', 3500000, 'Resort Unit', 'new', CURRENT_DATE - INTERVAL '1 day', 'New coastal property lead')
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent4_user_id IS NOT NULL THEN
    INSERT INTO public.leads (organization_id, agent_id, team_id, source_id, client_name, client_phone, client_email, destination, estimated_budget, project_type, status, received_date, notes)
    VALUES 
      (org_id, agent4_user_id, team2_id, lead_source_id, 'Youssef Farid', '+201234567896', 'youssef@example.com', 'New Capital', 1500000, 'Studio', 'qualified', CURRENT_DATE - INTERVAL '4 days', 'Budget-conscious buyer'),
      (org_id, agent4_user_id, team2_id, lead_source_id, 'Nour Tarek', '+201234567897', 'nour@example.com', '6th October', 8000000, 'Commercial', 'new', CURRENT_DATE, 'Commercial property inquiry')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- STEP 9: Create Client Requests
  -- ============================================
  IF agent1_user_id IS NOT NULL AND leader1_user_id IS NOT NULL THEN
    INSERT INTO public.client_requests (organization_id, agent_id, team_id, team_leader_id, client_name, client_phone, destination, client_budget, project_needed, status, delivery_date, agent_notes, created_at)
    VALUES 
      (org_id, agent1_user_id, team1_id, leader1_user_id, 'Khalid Mostafa', '+201234567898', 'New Cairo', 7000000, 'Villa with Pool', 'approved', CURRENT_DATE + INTERVAL '90 days', 'Client wants villa with private pool', CURRENT_DATE - INTERVAL '10 days'),
      (org_id, agent1_user_id, team1_id, leader1_user_id, 'Mona Samir', '+201234567899', 'Maadi', 2500000, '2BR Apartment', 'pending', CURRENT_DATE + INTERVAL '60 days', 'First-time buyer', CURRENT_DATE - INTERVAL '2 days')
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent2_user_id IS NOT NULL AND leader1_user_id IS NOT NULL THEN
    INSERT INTO public.client_requests (organization_id, agent_id, team_id, team_leader_id, client_name, client_phone, destination, client_budget, project_needed, status, delivery_date, agent_notes, created_at)
    VALUES 
      (org_id, agent2_user_id, team1_id, leader1_user_id, 'Tamer Waleed', '+201234567900', 'Heliopolis', 5000000, 'Townhouse', 'approved', CURRENT_DATE + INTERVAL '120 days', 'Family home requirement', CURRENT_DATE - INTERVAL '8 days'),
      (org_id, agent2_user_id, team1_id, leader1_user_id, 'Rania Fahmy', '+201234567901', 'Zamalek', 10000000, 'Penthouse', 'rejected', NULL, 'Budget too high for current market', CURRENT_DATE - INTERVAL '15 days')
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent3_user_id IS NOT NULL AND leader2_user_id IS NOT NULL THEN
    INSERT INTO public.client_requests (organization_id, agent_id, team_id, team_leader_id, client_name, client_phone, destination, client_budget, project_needed, status, delivery_date, agent_notes, created_at)
    VALUES 
      (org_id, agent3_user_id, team2_id, leader2_user_id, 'Amr Saber', '+201234567902', 'North Coast', 10000000, 'Beachfront Villa', 'approved', CURRENT_DATE + INTERVAL '180 days', 'Luxury vacation home', CURRENT_DATE - INTERVAL '12 days')
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent4_user_id IS NOT NULL AND leader2_user_id IS NOT NULL THEN
    INSERT INTO public.client_requests (organization_id, agent_id, team_id, team_leader_id, client_name, client_phone, destination, client_budget, project_needed, status, delivery_date, agent_notes, created_at)
    VALUES 
      (org_id, agent4_user_id, team2_id, leader2_user_id, 'Dina Magdy', '+201234567903', 'New Capital', 1800000, '1BR Apartment', 'pending', CURRENT_DATE + INTERVAL '45 days', 'Affordable housing', CURRENT_DATE - INTERVAL '5 days')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- STEP 10: Create Meetings
  -- ============================================
  IF agent1_user_id IS NOT NULL THEN
    SELECT id INTO deal1_id FROM public.deals WHERE agent_id = agent1_user_id AND stage = 'negotiation' LIMIT 1;
    SELECT id INTO request1_id FROM public.client_requests WHERE agent_id = agent1_user_id AND status = 'approved' LIMIT 1;

    INSERT INTO public.meetings (organization_id, agent_id, deal_id, client_request_id, title, description, meeting_date, meeting_time, duration_minutes, location, status, attendees)
    VALUES 
      (org_id, agent1_user_id, deal1_id, NULL, 'Property Viewing - Villa New Cairo', 'Site visit for villa property', CURRENT_DATE + INTERVAL '2 days', '10:00', 120, 'New Cairo Development', 'scheduled', '["Ahmed Mohamed", "Property Manager"]'::jsonb),
      (org_id, agent1_user_id, NULL, request1_id, 'Initial Consultation', 'Discuss client requirements', CURRENT_DATE + INTERVAL '3 days', '11:00', 90, 'Client Office', 'scheduled', '["Khalid Mostafa"]'::jsonb),
      (org_id, agent1_user_id, NULL, NULL, 'Initial Client Meeting', 'Met with potential client', CURRENT_DATE - INTERVAL '7 days', '15:00', 60, 'Coffee Shop', 'completed', '["Ahmed Mohamed"]'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent2_user_id IS NOT NULL THEN
    SELECT id INTO deal2_id FROM public.deals WHERE agent_id = agent2_user_id AND stage = 'contract_sent' LIMIT 1;

    INSERT INTO public.meetings (organization_id, agent_id, deal_id, client_request_id, title, description, meeting_date, meeting_time, duration_minutes, location, status, outcome, attendees)
    VALUES 
      (org_id, agent2_user_id, deal2_id, NULL, 'Contract Signing', 'Final contract signing meeting', CURRENT_DATE + INTERVAL '1 day', '14:00', 60, 'Office', 'scheduled', NULL, '["Tamer Waleed", "Legal Advisor"]'::jsonb),
      (org_id, agent2_user_id, NULL, NULL, 'Property Presentation', 'Presented townhouse options', CURRENT_DATE - INTERVAL '5 days', '16:00', 90, 'Office', 'completed', 'Client selected preferred unit', '["Tamer Waleed"]'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  IF agent3_user_id IS NOT NULL THEN
    INSERT INTO public.meetings (organization_id, agent_id, deal_id, client_request_id, title, description, meeting_date, meeting_time, duration_minutes, location, status, attendees)
    VALUES 
      (org_id, agent3_user_id, NULL, NULL, 'Beach Property Tour', 'Tour of beachfront properties', CURRENT_DATE + INTERVAL '5 days', '09:00', 180, 'North Coast', 'scheduled', '["Amr Saber"]'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- STEP 11: Create Attendance Logs (Last 14 Days)
  -- ============================================
  IF agent1_user_id IS NOT NULL OR agent2_user_id IS NOT NULL OR agent3_user_id IS NOT NULL OR agent4_user_id IS NOT NULL THEN
    FOR day_offset IN 0..13 LOOP
      loop_work_date := CURRENT_DATE - (day_offset || ' days')::interval;
      
      -- Skip weekends (Saturday = 6, Sunday = 0)
      IF EXTRACT(DOW FROM loop_work_date) NOT IN (0, 6) THEN
        IF agent1_user_id IS NOT NULL THEN
          INSERT INTO public.attendance_logs (organization_id, agent_id, check_in_time, check_out_time, work_date, location_check_in, location_check_out)
          VALUES (org_id, agent1_user_id, loop_work_date + INTERVAL '9 hours', loop_work_date + INTERVAL '17 hours', loop_work_date, 'Office', 'Office')
          ON CONFLICT (agent_id, work_date) DO NOTHING;
        END IF;

        IF agent2_user_id IS NOT NULL THEN
          INSERT INTO public.attendance_logs (organization_id, agent_id, check_in_time, check_out_time, work_date, location_check_in, location_check_out)
          VALUES (org_id, agent2_user_id, loop_work_date + INTERVAL '9 hours 30 minutes', loop_work_date + INTERVAL '17 hours 30 minutes', loop_work_date, 'Office', 'Office')
          ON CONFLICT (agent_id, work_date) DO NOTHING;
        END IF;

        IF agent3_user_id IS NOT NULL THEN
          INSERT INTO public.attendance_logs (organization_id, agent_id, check_in_time, check_out_time, work_date, location_check_in, location_check_out)
          VALUES (org_id, agent3_user_id, loop_work_date + INTERVAL '8 hours 45 minutes', loop_work_date + INTERVAL '16 hours 45 minutes', loop_work_date, 'Field', 'Field')
          ON CONFLICT (agent_id, work_date) DO NOTHING;
        END IF;

        IF agent4_user_id IS NOT NULL THEN
          INSERT INTO public.attendance_logs (organization_id, agent_id, check_in_time, check_out_time, work_date, location_check_in, location_check_out)
          VALUES (org_id, agent4_user_id, loop_work_date + INTERVAL '10 hours', loop_work_date + INTERVAL '18 hours', loop_work_date, 'Office', 'Office')
          ON CONFLICT (agent_id, work_date) DO NOTHING;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- ============================================
  -- STEP 12: Create Daily Agent Metrics (Last 7 Days)
  -- ============================================
  IF agent1_user_id IS NOT NULL OR agent2_user_id IS NOT NULL OR agent3_user_id IS NOT NULL OR agent4_user_id IS NOT NULL THEN
    FOR day_offset IN 0..6 LOOP
      loop_work_date := CURRENT_DATE - (day_offset || ' days')::interval;
      
      IF EXTRACT(DOW FROM loop_work_date) NOT IN (0, 6) THEN
        IF agent1_user_id IS NOT NULL THEN
          INSERT INTO public.daily_agent_metrics (organization_id, agent_id, work_date, active_calls_count, meetings_scheduled, requests_generated, deals_closed, mood, notes)
          VALUES (org_id, agent1_user_id, loop_work_date, 15 + (day_offset * 2), 2, 1, CASE WHEN day_offset = 0 THEN 1 ELSE 0 END, 'great', 'Productive day')
          ON CONFLICT (agent_id, work_date) DO NOTHING;
        END IF;

        IF agent2_user_id IS NOT NULL THEN
          INSERT INTO public.daily_agent_metrics (organization_id, agent_id, work_date, active_calls_count, meetings_scheduled, requests_generated, deals_closed, mood, notes)
          VALUES (org_id, agent2_user_id, loop_work_date, 12 + (day_offset * 1), 1, 0, CASE WHEN day_offset = 1 THEN 1 ELSE 0 END, 'good', 'Steady progress')
          ON CONFLICT (agent_id, work_date) DO NOTHING;
        END IF;

        IF agent3_user_id IS NOT NULL THEN
          INSERT INTO public.daily_agent_metrics (organization_id, agent_id, work_date, active_calls_count, meetings_scheduled, requests_generated, deals_closed, mood, notes)
          VALUES (org_id, agent3_user_id, loop_work_date, 20 + (day_offset * 3), 3, 2, CASE WHEN day_offset = 2 THEN 1 ELSE 0 END, 'great', 'High activity day')
          ON CONFLICT (agent_id, work_date) DO NOTHING;
        END IF;

        IF agent4_user_id IS NOT NULL THEN
          INSERT INTO public.daily_agent_metrics (organization_id, agent_id, work_date, active_calls_count, meetings_scheduled, requests_generated, deals_closed, mood, notes)
          VALUES (org_id, agent4_user_id, loop_work_date, 10 + day_offset, 1, 1, 0, 'okay', 'Working on leads')
          ON CONFLICT (agent_id, work_date) DO NOTHING;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- ============================================
  -- STEP 13: Create Agent Ratings (Last 7 Days)
  -- ============================================
  IF (leader1_user_id IS NOT NULL AND (agent1_user_id IS NOT NULL OR agent2_user_id IS NOT NULL)) OR
     (leader2_user_id IS NOT NULL AND (agent3_user_id IS NOT NULL OR agent4_user_id IS NOT NULL)) THEN
    FOR day_offset IN 0..6 LOOP
      loop_work_date := CURRENT_DATE - (day_offset || ' days')::interval;
      
      IF EXTRACT(DOW FROM loop_work_date) NOT IN (0, 6) THEN
        IF agent1_user_id IS NOT NULL AND leader1_user_id IS NOT NULL THEN
          INSERT INTO public.agent_daily_ratings (organization_id, agent_id, rated_by, rating_date, appearance_score, professionalism_score, honesty_score, kindness_score, leads_received_count, deals_closed_count, comments)
          VALUES (org_id, agent1_user_id, leader1_user_id, loop_work_date, 10, 10, 10, 10, 2, CASE WHEN day_offset = 0 THEN 1 ELSE 0 END, 'Excellent performance')
          ON CONFLICT (agent_id, rated_by, rating_date) DO NOTHING;
        END IF;

        IF agent2_user_id IS NOT NULL AND leader1_user_id IS NOT NULL THEN
          INSERT INTO public.agent_daily_ratings (organization_id, agent_id, rated_by, rating_date, appearance_score, professionalism_score, honesty_score, kindness_score, leads_received_count, deals_closed_count, comments)
          VALUES (org_id, agent2_user_id, leader1_user_id, loop_work_date, 8, 8, 8, 8, 1, CASE WHEN day_offset = 1 THEN 1 ELSE 0 END, 'Good work, keep it up')
          ON CONFLICT (agent_id, rated_by, rating_date) DO NOTHING;
        END IF;

        IF agent3_user_id IS NOT NULL AND leader2_user_id IS NOT NULL THEN
          INSERT INTO public.agent_daily_ratings (organization_id, agent_id, rated_by, rating_date, appearance_score, professionalism_score, honesty_score, kindness_score, leads_received_count, deals_closed_count, comments)
          VALUES (org_id, agent3_user_id, leader2_user_id, loop_work_date, 10, 10, 10, 10, 3, CASE WHEN day_offset = 2 THEN 1 ELSE 0 END, 'Outstanding results')
          ON CONFLICT (agent_id, rated_by, rating_date) DO NOTHING;
        END IF;

        IF agent4_user_id IS NOT NULL AND leader2_user_id IS NOT NULL THEN
          INSERT INTO public.agent_daily_ratings (organization_id, agent_id, rated_by, rating_date, appearance_score, professionalism_score, honesty_score, kindness_score, leads_received_count, deals_closed_count, comments)
          VALUES (org_id, agent4_user_id, leader2_user_id, loop_work_date, 8, 8, 6, 7, 1, 0, 'Improving, need more deals')
          ON CONFLICT (agent_id, rated_by, rating_date) DO NOTHING;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- ============================================
  -- STEP 14: Create Cost Entries
  -- ============================================
  IF finance_user_id IS NOT NULL THEN
    INSERT INTO public.cost_entries (organization_id, business_unit_id, category, amount, cost_month, description, is_fixed_cost, approval_status, created_by)
    VALUES 
      (org_id, bu1_id, 'rent', 50000, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'Office rent for City Central BU', true, 'approved', finance_user_id),
      (org_id, bu1_id, 'utilities', 15000, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'Electricity, water, internet', true, 'approved', finance_user_id),
      (org_id, bu1_id, 'other_fixed', 10000, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'Business insurance', true, 'approved', finance_user_id),
      (org_id, NULL, 'software_subscriptions', 20000, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'CRM and software subscriptions', true, 'approved', finance_user_id),
      (org_id, bu1_id, 'marketing', 30000, DATE_TRUNC('month', CURRENT_DATE), 'Digital marketing campaign', false, 'approved', finance_user_id),
      (org_id, bu1_id, 'travel', 15000, DATE_TRUNC('month', CURRENT_DATE), 'Agent travel expenses', false, 'approved', finance_user_id),
      (org_id, bu1_id, 'phone_bills', 8000, DATE_TRUNC('month', CURRENT_DATE), 'Phone and communication costs', false, 'approved', finance_user_id),
      (org_id, bu1_id, 'other_variable', 25000, DATE_TRUNC('month', CURRENT_DATE), 'Networking event sponsorship', false, 'approved', finance_user_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- STEP 15: Create Employee Salaries
  -- ============================================
  IF finance_user_id IS NOT NULL THEN
    IF agent1_user_id IS NOT NULL THEN
      INSERT INTO public.employee_salaries (organization_id, employee_id, monthly_salary, role, currency, effective_from, notes, created_by)
      VALUES (org_id, agent1_user_id, 8000, 'sales_agent', 'EGP', CURRENT_DATE - INTERVAL '3 months', 'Base salary for Sales Agent 1', finance_user_id)
      ON CONFLICT DO NOTHING;
    END IF;

    IF agent2_user_id IS NOT NULL THEN
      INSERT INTO public.employee_salaries (organization_id, employee_id, monthly_salary, role, currency, effective_from, notes, created_by)
      VALUES (org_id, agent2_user_id, 8000, 'sales_agent', 'EGP', CURRENT_DATE - INTERVAL '3 months', 'Base salary for Sales Agent 2', finance_user_id)
      ON CONFLICT DO NOTHING;
    END IF;

    IF agent3_user_id IS NOT NULL THEN
      INSERT INTO public.employee_salaries (organization_id, employee_id, monthly_salary, role, currency, effective_from, notes, created_by)
      VALUES (org_id, agent3_user_id, 8500, 'sales_agent', 'EGP', CURRENT_DATE - INTERVAL '3 months', 'Base salary for Sales Agent 3', finance_user_id)
      ON CONFLICT DO NOTHING;
    END IF;

    IF agent4_user_id IS NOT NULL THEN
      INSERT INTO public.employee_salaries (organization_id, employee_id, monthly_salary, role, currency, effective_from, notes, created_by)
      VALUES (org_id, agent4_user_id, 7500, 'sales_agent', 'EGP', CURRENT_DATE - INTERVAL '3 months', 'Base salary for Sales Agent 4', finance_user_id)
      ON CONFLICT DO NOTHING;
    END IF;

    IF leader1_user_id IS NOT NULL THEN
      INSERT INTO public.employee_salaries (organization_id, employee_id, monthly_salary, role, currency, effective_from, notes, created_by)
      VALUES (org_id, leader1_user_id, 12000, 'team_leader', 'EGP', CURRENT_DATE - INTERVAL '3 months', 'Base salary for Team Leader 1', finance_user_id)
      ON CONFLICT DO NOTHING;
    END IF;

    IF leader2_user_id IS NOT NULL THEN
      INSERT INTO public.employee_salaries (organization_id, employee_id, monthly_salary, role, currency, effective_from, notes, created_by)
      VALUES (org_id, leader2_user_id, 12000, 'team_leader', 'EGP', CURRENT_DATE - INTERVAL '3 months', 'Base salary for Team Leader 2', finance_user_id)
      ON CONFLICT DO NOTHING;
    END IF;

    IF manager1_user_id IS NOT NULL THEN
      INSERT INTO public.employee_salaries (organization_id, employee_id, monthly_salary, role, currency, effective_from, notes, created_by)
      VALUES (org_id, manager1_user_id, 15000, 'sales_manager', 'EGP', CURRENT_DATE - INTERVAL '3 months', 'Base salary for Sales Manager', finance_user_id)
      ON CONFLICT DO NOTHING;
    END IF;

    IF buhead1_user_id IS NOT NULL THEN
      INSERT INTO public.employee_salaries (organization_id, employee_id, monthly_salary, role, currency, effective_from, notes, created_by)
      VALUES (org_id, buhead1_user_id, 20000, 'business_unit_head', 'EGP', CURRENT_DATE - INTERVAL '3 months', 'Base salary for BU Head', finance_user_id)
      ON CONFLICT DO NOTHING;
    END IF;

    INSERT INTO public.employee_salaries (organization_id, employee_id, monthly_salary, role, currency, effective_from, notes, created_by)
    VALUES (org_id, finance_user_id, 18000, 'finance', 'EGP', CURRENT_DATE - INTERVAL '3 months', 'Base salary for Finance Manager', finance_user_id)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ============================================
  -- STEP 16: Create Deal Activities
  -- ============================================
  IF agent1_user_id IS NOT NULL THEN
    SELECT id INTO deal1_id FROM public.deals WHERE agent_id = agent1_user_id AND stage = 'negotiation' LIMIT 1;
    
    IF deal1_id IS NOT NULL THEN
      INSERT INTO public.deal_activities (deal_id, performed_by, activity_type, summary, activity_at)
      VALUES 
        (deal1_id, agent1_user_id, 'call', 'Initial client call - discussed requirements', CURRENT_DATE - INTERVAL '10 days'),
        (deal1_id, agent1_user_id, 'meeting', 'Property viewing scheduled', CURRENT_DATE - INTERVAL '5 days'),
        (deal1_id, agent1_user_id, 'email', 'Sent property details and pricing', CURRENT_DATE - INTERVAL '3 days'),
        (deal1_id, agent1_user_id, 'negotiation', 'Price negotiation in progress', CURRENT_DATE - INTERVAL '1 day')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  IF agent2_user_id IS NOT NULL THEN
    SELECT id INTO deal2_id FROM public.deals WHERE agent_id = agent2_user_id AND stage = 'contract_sent' LIMIT 1;
    
    IF deal2_id IS NOT NULL THEN
      INSERT INTO public.deal_activities (deal_id, performed_by, activity_type, summary, activity_at)
      VALUES 
        (deal2_id, agent2_user_id, 'call', 'First contact with client', CURRENT_DATE - INTERVAL '12 days'),
        (deal2_id, agent2_user_id, 'meeting', 'Property presentation meeting', CURRENT_DATE - INTERVAL '8 days'),
        (deal2_id, agent2_user_id, 'email', 'Sent contract documents', CURRENT_DATE - INTERVAL '2 days'),
        (deal2_id, agent2_user_id, 'follow-up', 'Contract signing scheduled', CURRENT_DATE)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RAISE NOTICE 'Mock data seed completed!';
  RAISE NOTICE 'If users were not found, create them in Supabase Auth first, then run this script again.';
  
END $$;

