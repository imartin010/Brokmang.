-- Assign Sales Agents to Team Leaders
-- This creates the organizational tree structure

-- Get user IDs
DO $$
DECLARE
  leader1_id uuid;
  leader2_id uuid;
  agent1_id uuid;
  agent2_id uuid;
  agent3_id uuid;
  agent4_id uuid;
  team1_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  team2_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
BEGIN
  -- Get team leader IDs
  SELECT id INTO leader1_id FROM auth.users WHERE email = 'leader1@test.com';
  SELECT id INTO leader2_id FROM auth.users WHERE email = 'leader2@test.com';
  
  -- Get agent IDs
  SELECT id INTO agent1_id FROM auth.users WHERE email = 'agent1@test.com';
  SELECT id INTO agent2_id FROM auth.users WHERE email = 'agent2@test.com';
  SELECT id INTO agent3_id FROM auth.users WHERE email = 'agent3@test.com';
  SELECT id INTO agent4_id FROM auth.users WHERE email = 'agent4@test.com';

  -- Ensure teams exist with correct leaders
  IF leader1_id IS NOT NULL THEN
    INSERT INTO public.teams (id, business_unit_id, name, leader_id)
    VALUES (team1_id, '11111111-1111-1111-1111-111111111111', 'Alpha Team', leader1_id)
    ON CONFLICT (id) DO UPDATE SET leader_id = leader1_id;
  END IF;

  IF leader2_id IS NOT NULL THEN
    INSERT INTO public.teams (id, business_unit_id, name, leader_id)
    VALUES (team2_id, '11111111-1111-1111-1111-111111111111', 'Beta Team', leader2_id)
    ON CONFLICT (id) DO UPDATE SET leader_id = leader2_id;
  END IF;

  -- Assign Sales Agent 1 and 2 to Team Leader Alpha (Team 1)
  IF agent1_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id)
    VALUES (team1_id, agent1_id)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  IF agent2_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id)
    VALUES (team1_id, agent2_id)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  -- Assign Sales Agent 3 and 4 to Team Leader Beta (Team 2)
  IF agent3_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id)
    VALUES (team2_id, agent3_id)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  IF agent4_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id)
    VALUES (team2_id, agent4_id)
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  RAISE NOTICE '✓ Organizational tree updated:';
  RAISE NOTICE '  Team Leader Alpha → Sales Agent 1, Sales Agent 2';
  RAISE NOTICE '  Team Leader Beta → Sales Agent 3, Sales Agent 4';
END $$;

-- Verify the assignments
SELECT 
  t.name as team_name,
  p_leader.full_name as team_leader,
  p_member.full_name as team_member,
  p_member.email as member_email
FROM public.teams t
LEFT JOIN public.profiles p_leader ON p_leader.id = t.leader_id
LEFT JOIN public.team_members tm ON tm.team_id = t.id
LEFT JOIN public.profiles p_member ON p_member.id = tm.user_id
WHERE t.id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ORDER BY t.name, p_member.full_name;

