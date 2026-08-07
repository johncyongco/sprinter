#!/usr/bin/env bash
# Sprinter — Supabase database audit (read-only)
# Run on your Supabase host, inside /opt/supabase/docker:
#   bash supabase-audit.sh
# It prints whether your Google user exists, whether stories reach the DB,
# and whether RLS policies allow writes.

set -e
cd "$(dirname "$0")/.." 2>/dev/null || cd /opt/supabase/docker || true

echo "=========================================================="
echo "1) Google users registered in Supabase Auth"
echo "   (is jcyongco21@gmail.com here?)"
echo "=========================================================="
docker exec supabase-db psql -U postgres -d postgres -c \
  "select id, email, created_at from auth.users order by created_at desc limit 20;"

echo
echo "=========================================================="
echo "2) Stories actually in the database"
echo "=========================================================="
docker exec supabase-db psql -U postgres -d postgres -c \
  "select id, title, seed_author_id, created_at from public.stories order by created_at desc limit 20;"

echo
echo "=========================================================="
echo "3) RLS policies on Sprinter tables"
echo "   (you must see INSERT/UPDATE 'authenticated' policies)"
echo "=========================================================="
docker exec supabase-db psql -U postgres -d postgres -c \
  "select tablename, policyname, cmd, roles from pg_policies where schemaname='public' and tablename in ('stories','saved_seeds','continuations','critiques','words','profiles');"

echo
echo "=========================================================="
echo "4) Row counts for all Sprinter tables"
echo "=========================================================="
docker exec supabase-db psql -U postgres -d postgres -c \
  "select 'stories' as t, count(*) from public.stories
   union all select 'saved_seeds', count(*) from public.saved_seeds
   union all select 'continuations', count(*) from public.continuations
   union all select 'critiques', count(*) from public.critiques
   union all select 'words', count(*) from public.words
   union all select 'profiles', count(*) from public.profiles;"

echo
echo "Done. Paste this output so we can fix the saving/database issue."
