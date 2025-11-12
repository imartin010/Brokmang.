-- Database Verification Script
-- Run this to verify that all migrations are applied correctly
-- and that the database structure is complete

-- ============================================
-- CHECK 1: Verify Core Tables Exist
-- ============================================

DO $$
DECLARE
  missing_tables text[];
  tbl_name text;
  required_tables text[] := ARRAY[
    'organizations',
    'business_units',
    'teams',
    'profiles',
    'team_members',
    'deals',
    'deal_sources',
    'deal_activities',
    'attendance_logs',
    'client_requests',
    'daily_agent_metrics',
    'meetings',
    'leads',
    'agent_daily_ratings',
    'agent_supervision',
    'cost_entries',
    'employee_salaries',
    'commission_config',
    'tax_config',
    'ai_insight_runs'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY required_tables
  LOOP
    IF NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = tbl_name
    ) THEN
      missing_tables := array_append(missing_tables, tbl_name);
    END IF;
  END LOOP;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE WARNING 'Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✓ All required tables exist';
  END IF;
END $$;

-- ============================================
-- CHECK 2: Verify Views Exist
-- ============================================

DO $$
DECLARE
  missing_views text[];
  vw_name text;
  required_views text[] := ARRAY[
    'agent_dashboard_summary',
    'team_leader_dashboard',
    'team_member_performance',
    'business_unit_finance_overview',
    'organization_overview',
    'attendance_today',
    'upcoming_meetings',
    'pnl_overview',
    'pnl_monthly_summary',
    'agent_performance_report',
    'team_performance_report',
    'business_unit_combined_report',
    'ai_insight_recent'
  ];
BEGIN
  FOREACH vw_name IN ARRAY required_views
  LOOP
    IF NOT EXISTS (
      SELECT FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name = vw_name
    ) THEN
      missing_views := array_append(missing_views, vw_name);
    END IF;
  END LOOP;

  IF array_length(missing_views, 1) > 0 THEN
    RAISE WARNING 'Missing views: %', array_to_string(missing_views, ', ');
  ELSE
    RAISE NOTICE '✓ All required views exist';
  END IF;
END $$;

-- ============================================
-- CHECK 3: Verify RLS is Enabled
-- ============================================

DO $$
DECLARE
  tables_without_rls text[];
  tbl_name text;
  tables_to_check text[] := ARRAY[
    'organizations',
    'business_units',
    'teams',
    'profiles',
    'team_members',
    'deals',
    'deal_sources',
    'deal_activities',
    'attendance_logs',
    'client_requests',
    'daily_agent_metrics',
    'meetings',
    'leads',
    'agent_daily_ratings',
    'agent_supervision',
    'cost_entries',
    'employee_salaries',
    'commission_config',
    'tax_config',
    'ai_insight_runs'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY tables_to_check
  LOOP
    IF NOT EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = tbl_name
      AND rowsecurity = true
    ) THEN
      tables_without_rls := array_append(tables_without_rls, tbl_name);
    END IF;
  END LOOP;

  IF array_length(tables_without_rls, 1) > 0 THEN
    RAISE WARNING 'Tables without RLS: %', array_to_string(tables_without_rls, ', ');
  ELSE
    RAISE NOTICE '✓ RLS is enabled on all required tables';
  END IF;
END $$;

-- ============================================
-- CHECK 4: Verify Indexes Exist
-- ============================================

DO $$
DECLARE
  missing_indexes text[];
  idx_name text;
  required_indexes text[] := ARRAY[
    'deals_org_idx',
    'deals_agent_idx',
    'deals_stage_idx',
    'attendance_logs_agent_idx',
    'attendance_logs_date_idx',
    'leads_agent_idx',
    'leads_status_idx',
    'meetings_agent_idx',
    'meetings_date_idx'
  ];
BEGIN
  FOREACH idx_name IN ARRAY required_indexes
  LOOP
    IF NOT EXISTS (
      SELECT FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname = idx_name
    ) THEN
      missing_indexes := array_append(missing_indexes, idx_name);
    END IF;
  END LOOP;

  IF array_length(missing_indexes, 1) > 0 THEN
    RAISE WARNING 'Missing indexes: %', array_to_string(missing_indexes, ', ');
  ELSE
    RAISE NOTICE '✓ All required indexes exist';
  END IF;
END $$;

-- ============================================
-- CHECK 5: Verify Organization Exists
-- ============================================

DO $$
DECLARE
  org_count int;
  org_id uuid := '3664ed88-2563-4abf-81e3-3cf405dd7580';
BEGIN
  SELECT COUNT(*) INTO org_count
  FROM public.organizations
  WHERE id = org_id;

  IF org_count = 0 THEN
    RAISE WARNING 'Organization with ID % does not exist', org_id;
  ELSE
    RAISE NOTICE '✓ Organization exists';
  END IF;
END $$;

-- ============================================
-- CHECK 6: Verify Deal Sources Exist
-- ============================================

DO $$
DECLARE
  source_count int;
  org_id uuid := '3664ed88-2563-4abf-81e3-3cf405dd7580';
BEGIN
  SELECT COUNT(*) INTO source_count
  FROM public.deal_sources
  WHERE organization_id = org_id;

  IF source_count = 0 THEN
    RAISE WARNING 'No deal sources found for organization';
  ELSE
    RAISE NOTICE '✓ Deal sources exist (% sources found)', source_count;
  END IF;
END $$;

-- ============================================
-- CHECK 7: Verify Commission Config Exists
-- ============================================

DO $$
DECLARE
  config_count int;
  org_id uuid := '3664ed88-2563-4abf-81e3-3cf405dd7580';
BEGIN
  SELECT COUNT(*) INTO config_count
  FROM public.commission_config
  WHERE organization_id = org_id
  AND effective_to IS NULL;

  IF config_count = 0 THEN
    RAISE WARNING 'No active commission configurations found';
  ELSE
    RAISE NOTICE '✓ Commission configurations exist (% active configs)', config_count;
  END IF;
END $$;

-- ============================================
-- CHECK 8: Verify Tax Config Exists
-- ============================================

DO $$
DECLARE
  tax_config_count int;
  org_id uuid := '3664ed88-2563-4abf-81e3-3cf405dd7580';
BEGIN
  SELECT COUNT(*) INTO tax_config_count
  FROM public.tax_config
  WHERE organization_id = org_id
  AND effective_to IS NULL;

  IF tax_config_count = 0 THEN
    RAISE WARNING 'No active tax configurations found';
  ELSE
    RAISE NOTICE '✓ Tax configurations exist (% active configs)', tax_config_count;
  END IF;
END $$;

-- ============================================
-- CHECK 9: Verify RLS Policies Exist
-- ============================================

DO $$
DECLARE
  policy_count int;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

  IF policy_count < 50 THEN
    RAISE WARNING 'Low number of RLS policies found (%)', policy_count;
  ELSE
    RAISE NOTICE '✓ RLS policies exist (% policies found)', policy_count;
  END IF;
END $$;

-- ============================================
-- CHECK 10: Verify Functions Exist
-- ============================================

DO $$
DECLARE
  func_count int;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname = 'set_updated_at';

  IF func_count = 0 THEN
    RAISE WARNING 'set_updated_at function does not exist';
  ELSE
    RAISE NOTICE '✓ Required functions exist';
  END IF;
END $$;

-- ============================================
-- SUMMARY
-- ============================================

SELECT 
  'Database verification complete!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
  (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public') as total_views,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes;

