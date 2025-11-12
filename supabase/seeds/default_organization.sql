insert into public.organizations (id, name, timezone)
values (
  :'default_organization_id',
  'Primary Organization',
  'UTC'
)
on conflict (id) do update set name = excluded.name;




