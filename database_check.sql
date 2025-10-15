-- Check current database schema and data
-- Run this in your Supabase SQL Editor to see what's currently in the database

-- Check if table exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'superadmin_users'
ORDER BY ordinal_position;

-- Check current data
SELECT id, username, role, is_active, login_attempts, locked_until, created_at
FROM superadmin_users;

-- If you see a simple schema with just 'password' field, run the migration:
-- 1. First backup: CREATE TABLE superadmin_users_backup AS SELECT * FROM superadmin_users;
-- 2. Then run the migration script in database_migration.sql