set check_function_bodies = off;
set search_path = public;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid();
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.has_any_role(target_roles public.user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = any(target_roles) from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.can_access_business_unit(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        organization_id = public.current_organization_id()
        and (
          public.has_any_role(array['sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[])
          or leader_id = auth.uid()
          or exists (
            select 1
            from public.teams t
            join public.team_members tm on tm.team_id = t.id
            where t.business_unit_id = bu.id
              and tm.user_id = auth.uid()
          )
          or exists (
            select 1
            from public.teams t
            where t.business_unit_id = bu.id
              and t.leader_id = auth.uid()
          )
        )
      from public.business_units bu
      where bu.id = target_id
    ),
    false
  );
$$;

create or replace function public.can_access_team(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        public.can_access_business_unit(t.business_unit_id)
        or t.leader_id = auth.uid()
        or exists (
          select 1
          from public.team_members tm
          where tm.team_id = t.id
            and tm.user_id = auth.uid()
        )
        or exists (
          select 1
          from public.business_units bu
          where bu.id = t.business_unit_id
            and bu.leader_id = auth.uid()
        )
        or public.has_any_role(array['sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[])
      from public.teams t
      where t.id = target_id
    ),
    false
  );
$$;

create or replace function public.can_access_profile(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        organization_id = public.current_organization_id()
        and (
          id = auth.uid()
          or public.has_any_role(array['sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[])
          or (
            public.has_any_role(array['team_leader']::public.user_role[])
            and exists (
              select 1
              from public.team_members tm
              join public.teams t on t.id = tm.team_id
              where tm.user_id = target_id
                and t.leader_id = auth.uid()
            )
          )
        )
      from public.profiles
      where id = target_id
    ),
    false
  );
$$;

create or replace function public.can_access_deal(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        organization_id = public.current_organization_id()
        and (
          agent_id = auth.uid()
          or (team_id is not null and public.can_access_team(team_id))
          or (business_unit_id is not null and public.can_access_business_unit(business_unit_id))
          or public.has_any_role(array['sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[])
        )
      from public.deals
      where id = target_id
    ),
    false
  );
$$;

create or replace view public.user_team_hierarchy as
select
  tm.user_id,
  tm.team_id,
  t.business_unit_id,
  bu.organization_id,
  'member'::text as relation
from public.team_members tm
join public.teams t on t.id = tm.team_id
join public.business_units bu on bu.id = t.business_unit_id

union
select
  t.leader_id as user_id,
  t.id as team_id,
  t.business_unit_id,
  bu.organization_id,
  'team_lead'::text as relation
from public.teams t
join public.business_units bu on bu.id = t.business_unit_id
where t.leader_id is not null

union
select
  bu.leader_id as user_id,
  null::uuid as team_id,
  bu.id as business_unit_id,
  bu.organization_id,
  'business_unit_lead'::text as relation
from public.business_units bu
where bu.leader_id is not null

union
select
  p.id as user_id,
  null::uuid as team_id,
  null::uuid as business_unit_id,
  p.organization_id,
  'executive'::text as relation
from public.profiles p
where p.role = any (array['sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[]);

alter table public.organizations enable row level security;
alter table public.business_units enable row level security;
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.team_members enable row level security;
alter table public.deal_sources enable row level security;
alter table public.deals enable row level security;
alter table public.deal_activities enable row level security;
alter table public.performance_cycles enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.financial_snapshots enable row level security;
alter table public.kpi_targets enable row level security;
alter table public.ai_insight_runs enable row level security;

create policy organizations_select on public.organizations
for select
using (id = public.current_organization_id());

create policy organizations_admin_write on public.organizations
for all
using (public.has_any_role(array['admin']::public.user_role[]))
with check (public.has_any_role(array['admin']::public.user_role[]));

create policy business_units_select on public.business_units
for select
using (public.can_access_business_unit(id));

create policy teams_select on public.teams
for select
using (public.can_access_team(id));

create policy profiles_select on public.profiles
for select
using (public.can_access_profile(id));

create policy team_members_select on public.team_members
for select
using (public.can_access_team(team_id));

create policy deal_sources_select on public.deal_sources
for select
using (organization_id = public.current_organization_id());

create policy deals_select on public.deals
for select
using (public.can_access_deal(id));

create policy deal_activities_select on public.deal_activities
for select
using (public.can_access_deal(deal_id));

create policy performance_cycles_select on public.performance_cycles
for select
using (organization_id = public.current_organization_id());

create policy performance_reviews_select on public.performance_reviews
for select
using (
  public.can_access_profile(reviewee_id)
  or public.can_access_profile(reviewer_id)
  or public.has_any_role(array['sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[])
);

create policy financial_snapshots_select on public.financial_snapshots
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.has_any_role(array['finance', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
    or (business_unit_id is not null and public.can_access_business_unit(business_unit_id))
  )
);

create policy kpi_targets_select on public.kpi_targets
for select
using (
  organization_id = public.current_organization_id()
  and (
    public.has_any_role(array['sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[])
    or (team_id is not null and public.can_access_team(team_id))
    or (business_unit_id is not null and public.can_access_business_unit(business_unit_id))
  )
);

create policy ai_insight_runs_select on public.ai_insight_runs
for select
using (
  organization_id = public.current_organization_id()
  and (
    initiated_by = auth.uid()
    or public.has_any_role(array['sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[])
  )
);

comment on view public.user_team_hierarchy is
  'Denormalized mapping of users to teams, business units, and organizations to support access control queries.';

comment on schema public is 'Application schema for brokmang.';

