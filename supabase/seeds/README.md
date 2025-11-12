# Supabase Seed Data

Placeholder seed scripts for brokmang. Populate these files with deterministic fixtures per environment.

Recommended order:

1. `organizations` and related hierarchy (`business_units`, `teams`)
2. `profiles` and `team_members`
3. Reference data such as `deal_sources`
4. Sample `deals`, `performance_cycles`, and `financial_snapshots`

Create additional seed files with the naming convention `00xx_<description>.sql` and run them via the Supabase CLI. For example, to ensure the default organization exists:

```bash
supabase db remote commit --password "$SUPABASE_DB_PASSWORD"
supabase db reset --use-migra
psql "$SUPABASE_DB_URL" -f supabase/seeds/default_organization.sql --set default_organization_id=$DEFAULT_ORGANIZATION_ID
```

```bash
supabase db reset --use-migra
supabase db seed -f supabase/seeds/0010_sample_data.sql
```
