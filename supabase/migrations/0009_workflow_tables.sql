set check_function_bodies = off;
set search_path = public;

drop table if exists public.assist_requests cascade;
drop table if exists public.coaching_notes cascade;
drop table if exists public.finance_adjustments cascade;
drop table if exists public.initiatives cascade;
drop table if exists public.activity_log cascade;

drop type if exists public.assist_request_status cascade;
drop type if exists public.finance_adjustment_status cascade;
drop type if exists public.initiative_status cascade;

create type public.assist_request_status as enum ('open', 'in_progress', 'resolved', 'declined');

create type public.finance_adjustment_status as enum ('pending', 'approved', 'rejected');

create type public.initiative_status as enum ('draft', 'active', 'completed', 'archived');

create table public.assist_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  assignee_id uuid references public.profiles(id) on delete set null,
  status public.assist_request_status not null default 'open',
  subject text not null,
  details text,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assist_requests_org_idx on public.assist_requests (organization_id);
create index assist_requests_status_idx on public.assist_requests (status);

create trigger assist_requests_updated_at
before update on public.assist_requests
for each row
execute procedure public.set_updated_at();

create table public.coaching_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  participant_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  note text not null,
  visibility text not null default 'team', -- team, management, private
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index coaching_notes_org_idx on public.coaching_notes (organization_id);
create index coaching_notes_participant_idx on public.coaching_notes (participant_id);

create trigger coaching_notes_updated_at
before update on public.coaching_notes
for each row
execute procedure public.set_updated_at();

create table public.finance_adjustments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_unit_id uuid references public.business_units(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  approved_by uuid references public.profiles(id) on delete set null,
  status public.finance_adjustment_status not null default 'pending',
  amount numeric(14,2) not null default 0,
  reason text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index finance_adjustments_org_idx on public.finance_adjustments (organization_id);
create index finance_adjustments_status_idx on public.finance_adjustments (status);

create trigger finance_adjustments_updated_at
before update on public.finance_adjustments
for each row
execute procedure public.set_updated_at();

create table public.initiatives (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  status public.initiative_status not null default 'draft',
  target_metric text,
  target_value numeric(14,2),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index initiatives_org_idx on public.initiatives (organization_id);
create index initiatives_status_idx on public.initiatives (status);

create trigger initiatives_updated_at
before update on public.initiatives
for each row
execute procedure public.set_updated_at();

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_org_idx on public.activity_log (organization_id, created_at desc);

alter table public.assist_requests enable row level security;
alter table public.coaching_notes enable row level security;
alter table public.finance_adjustments enable row level security;
alter table public.initiatives enable row level security;
alter table public.activity_log enable row level security;

create policy assist_requests_select on public.assist_requests
for select
using (
  organization_id = public.current_organization_id()
  and (
    requester_id = auth.uid()
    or assignee_id = auth.uid()
    or public.has_any_role(array['team_leader', 'sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[])
  )
);

create policy assist_requests_insert on public.assist_requests
for insert
with check (
  organization_id = public.current_organization_id()
  and requester_id = auth.uid()
);

create policy assist_requests_update on public.assist_requests
for update
using (
  organization_id = public.current_organization_id()
  and (
    requester_id = auth.uid()
    or assignee_id = auth.uid()
    or public.has_any_role(array['sales_manager', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
  )
)
with check (
  organization_id = public.current_organization_id()
);

create policy assist_requests_delete on public.assist_requests
for delete
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['sales_manager', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
);

create policy coaching_notes_select on public.coaching_notes
for select
using (
  organization_id = public.current_organization_id()
  and (
    author_id = auth.uid()
    or participant_id = auth.uid()
    or public.has_any_role(array['team_leader', 'sales_manager', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
  )
);

create policy coaching_notes_insert on public.coaching_notes
for insert
with check (
  organization_id = public.current_organization_id()
  and (
    author_id = auth.uid()
    or public.has_any_role(array['team_leader', 'sales_manager', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
  )
);

create policy coaching_notes_update on public.coaching_notes
for update
using (
  organization_id = public.current_organization_id()
  and (
    author_id = auth.uid()
    or public.has_any_role(array['sales_manager', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
  )
)
with check (organization_id = public.current_organization_id());

create policy coaching_notes_delete on public.coaching_notes
for delete
using (
  organization_id = public.current_organization_id()
  and (
    author_id = auth.uid()
    or public.has_any_role(array['sales_manager', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
  )
);

create policy finance_adjustments_select on public.finance_adjustments
for select
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['finance', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
);

create policy finance_adjustments_insert on public.finance_adjustments
for insert
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['finance']::public.user_role[])
);

create policy finance_adjustments_update on public.finance_adjustments
for update
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['finance', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
)
with check (organization_id = public.current_organization_id());

create policy finance_adjustments_delete on public.finance_adjustments
for delete
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['finance', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
);

create policy initiatives_select on public.initiatives
for select
using (organization_id = public.current_organization_id());

create policy initiatives_insert on public.initiatives
for insert
with check (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['sales_manager', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
);

create policy initiatives_update on public.initiatives
for update
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['sales_manager', 'business_unit_head', 'ceo', 'admin']::public.user_role[])
)
with check (organization_id = public.current_organization_id());

create policy initiatives_delete on public.initiatives
for delete
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['ceo', 'admin']::public.user_role[])
);

create policy activity_log_select on public.activity_log
for select
using (
  organization_id = public.current_organization_id()
  and public.has_any_role(array['team_leader', 'sales_manager', 'business_unit_head', 'finance', 'ceo', 'admin']::public.user_role[])
);

create policy activity_log_insert on public.activity_log
for insert
with check (organization_id = public.current_organization_id());


