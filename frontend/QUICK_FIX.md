# Quick Fix for "Create Pattern" Issue

## The Problem
The "Create Pattern" functionality is failing because of Row Level Security (RLS) policies in Supabase that are preventing user creation.

## Solutions (Try in order)

### Solution 1: Update RLS Policies (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste this SQL:

```sql
-- Fix RLS policy for user creation
DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
```

4. Click "RUN" to execute

### Solution 2: Use Service Role Key
Your app is already configured to use the service role key for user creation. Make sure your `.env` file has:

```
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtY2pqcWlpaG9tbmhoenNzb3p5Iiwicm9sZSI6InNlcnZpY2Vfc29sZSIsImlhdCI6MTc1NzU3MTk2MiwiZXhwIjoyMDczMTQ3OTYyfQ.6EisAeHpUPzPBnUFlUlkSgydojSr_BDC_47Or0bTelQ
```

(This is already in your `.env` file)

### Solution 3: Temporary Fix (Last resort)
If the above doesn't work, temporarily disable RLS:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**Note**: Remember to re-enable it later for security:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## After Applying the Fix

1. Restart your development server
2. Try creating a pattern again
3. It should work now!

## Verification Steps

1. Go to `/database-test` page
2. Click "Run Database Tests"
3. All tests should pass
4. Try creating a pattern from the main organize page