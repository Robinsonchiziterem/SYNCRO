# Contributing to SYNCRO

## Database Migrations

SYNCRO uses the [Supabase CLI](https://supabase.com/docs/guides/cli) to manage database migrations.
All migration files live in `supabase/migrations/` and are applied in lexicographic order.

### Prerequisites

Install the Supabase CLI:

```bash
# macOS / Linux (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (any platform)
npm install -g supabase
```

### Local development setup

```bash
# 1. Start the local Supabase stack (Postgres + Studio + Auth)
supabase start

# 2. Apply all pending migrations
npm run db:migrate   # from /backend, or: supabase db push

# 3. Seed local database with test data
supabase db reset    # applies migrations + seed.sql automatically
```

The local Studio UI is available at http://localhost:54323.

### Creating a new migration

Always use the CLI to generate migration files — this ensures the timestamp prefix is correct:

```bash
# From the repo root
supabase migration new <description>
# e.g. supabase migration new add_notifications_table
```

This creates `supabase/migrations/YYYYMMDDHHMMSS_<description>.sql`.
Write your SQL in that file, then apply it locally with `supabase db push`.

### Migration naming convention

```
YYYYMMDDHHMMSS_short_description.sql
```

Examples:
- `20240115000000_create_push_subscriptions.sql`
- `20240117000000_add_2fa_tables.sql`

### Applying migrations

| Environment | Command |
|-------------|---------|
| Local       | `npm run db:migrate` |
| Production  | `npm run db:migrate:prod` (requires `PRODUCTION_DB_URL` env var) |
| Reset local | `npm run db:reset` |

### Rollback strategy

Supabase does not support automatic down migrations. For each migration that makes
destructive changes, document the manual rollback steps in a comment block at the
top of the migration file:

```sql
-- ROLLBACK:
--   ALTER TABLE public.example DROP COLUMN IF EXISTS new_column;
```

For non-destructive migrations (adding tables, indexes, columns with defaults),
the rollback is simply dropping the added object.

### CI validation

Every pull request that touches `supabase/migrations/` triggers the
`.github/workflows/database.yml` workflow, which:

1. Starts a fresh local Supabase stack
2. Applies all migrations from scratch (`supabase db push`)
3. Runs `supabase db lint` to catch SQL issues

A PR cannot be merged if this workflow fails.

### Seed data

`supabase/seed.sql` contains fake data for local development only.
It is applied automatically by `supabase db reset`.

**Never add real emails, payment data, or any PII to seed.sql.**
