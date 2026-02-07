"""Execute SQL migrations using Supabase PostgreSQL connection"""
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_KEY')  # This should actually be the SERVICE ROLE key

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: Missing Supabase credentials")
    exit(1)

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("="*70)
print("  🚀 Running SQL Migrations for Availability Feature")
print("="*70)

# Migration SQL statements
migrations = [
    {
        "name": "Add schedule settings to establishments",
        "sql": """
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS opening_time TEXT DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS closing_time TEXT DEFAULT '20:00',
ADD COLUMN IF NOT EXISTS lunch_start TEXT DEFAULT '12:00',
ADD COLUMN IF NOT EXISTS lunch_end TEXT DEFAULT '13:00';
        """.strip()
    },
    {
        "name": "Drop old status constraint",
        "sql": "ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;"
    },
    {
        "name": "Add bloqueio status constraint",
        "sql": """
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('agendado', 'concluido', 'cancelado', 'bloqueio'));
        """.strip()
    },
    {
        "name": "Make service_id nullable",
        "sql": "ALTER TABLE appointments ALTER COLUMN service_id DROP NOT NULL;"
    },
    {
        "name": "Make cliente_id nullable",
        "sql": "ALTER TABLE appointments ALTER COLUMN cliente_id DROP NOT NULL;"
    }
]

# Try to execute using raw SQL via supabase-py
# Note: supabase-py doesn't directly support DDL, so we need to use rpc or query
success_count = 0
failed_count = 0

for i, migration in enumerate(migrations, 1):
    print(f"\n[{i}/{len(migrations)}] {migration['name']}...")
    
    try:
        # Use the query method with execute_sql (if supported)
        # This might not work with regular API key - needs service role key
        result = supabase.rpc('exec_sql', {'sql': migration['sql']}).execute()
        print(f"   ✅ SUCCESS")
        success_count += 1
    except Exception as e:
        error_msg = str(e)
        if 'exec_sql' in error_msg or 'function' in error_msg.lower():
            print(f"   ⚠️  SKIPPED - exec_sql function not available")
            print(f"   Note: This requires a custom Postgres function or direct SQL access")
            failed_count += 1
        else:
            print(f"   ❌ FAILED: {error_msg}")
            failed_count += 1

print("\n" + "="*70)
if failed_count > 0:
    print(f"\n⚠️  Could not auto-execute migrations ({success_count} succeeded, {failed_count} failed)")
    print("\n📋 MANUAL EXECUTION REQUIRED:")
    print("   1. Open Supabase Dashboard SQL Editor")
    print(f"   2. Go to: {SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql")
    print("   3. Copy and run 'migration_availability_feature.sql'")
    print("\n   Or run each statement individually:\n")
    
    for i, migration in enumerate(migrations, 1):
        print(f"   -- {migration['name']}")
        print(f"   {migration['sql']}\n")
else:
    print(f"\n✅ All {success_count} migrations executed successfully!")

print("="*70)
