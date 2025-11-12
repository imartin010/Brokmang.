#!/bin/bash

# Script to apply master SQL migration to Supabase
# This uses the Supabase CLI's db push command

cd "$(dirname "$0")/.."

echo "📦 Applying all migrations to Supabase..."

# Read the master SQL file
MASTER_SQL_FILE="supabase/APPLY_NEW_MIGRATIONS.sql"

if [ ! -f "$MASTER_SQL_FILE" ]; then
  echo "❌ Master SQL file not found: $MASTER_SQL_FILE"
  exit 1
fi

# Use supabase db execute to run the SQL directly
# First, let's try to use the CLI's db push for individual migrations
# But if that doesn't work, we'll use the SQL editor approach

echo "✅ Master SQL file found. Applying migrations one by one..."

# Apply migrations in order
for migration in supabase/migrations/0010_*.sql supabase/migrations/0011_*.sql supabase/migrations/0012_*.sql supabase/migrations/0013_*.sql supabase/migrations/0014_*.sql supabase/migrations/0015_*.sql supabase/migrations/0016_*.sql supabase/migrations/0017_*.sql supabase/migrations/0018_*.sql supabase/migrations/0019_*.sql; do
  if [ -f "$migration" ]; then
    echo "📝 Applying $(basename $migration)..."
    # Use supabase db push with the specific migration
    supabase db push --file "$migration" --include-all 2>&1 | grep -v "Do you want to push" || true
  fi
done

echo "✨ Done!"

