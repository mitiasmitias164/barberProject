"""Run SQL migrations directly on Supabase using HTTP API"""
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL or SUPABASE_KEY not found in backend/.env")
    exit(1)

# Extract project ref from URL
# URL format: https://xxxxx.supabase.co
project_ref = SUPABASE_URL.split('//')[1].split('.')[0]

print("="*60)
print("SQL Migration Script for Availability Feature")
print("="*60)
print(f"\nProject: {project_ref}")
print(f"URL: {SUPABASE_URL}\n")

# Read the migration file
with open('migration_availability_feature.sql', 'r', encoding='utf-8') as f:
    migration_sql = f.read()

# Remove comments and split into individual statements
lines = migration_sql.split('\n')
cleaned_lines = []
for line in lines:
    # Skip comment lines and empty lines
    stripped = line.strip()
    if stripped and not stripped.startswith('--'):
        cleaned_lines.append(line)

# Combine and split by semicolon
full_sql = '\n'.join(cleaned_lines)
statements = [s.strip() + ';' for s in full_sql.split(';') if s.strip()]

print(f"Found {len(statements)} SQL statements to execute\n")
print("="*60)

# Manual execution instructions
print("\n⚠️  IMPORTANT: Direct SQL execution via API requires service role key")
print("For security, please run these migrations manually in Supabase:\n")
print("1. Go to your Supabase project dashboard")
print(f"2. Navigate to: {SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/')}")
print("3. Click on 'SQL Editor' in the left sidebar")
print("4. Create a new query and paste the contents of 'migration_availability_feature.sql'")
print("5. Click 'Run' to execute the migration\n")

print("="*60)
print("\nAlternatively, copy and execute these statements:\n")
print("="*60)

for i, stmt in enumerate(statements, 1):
    if stmt.strip():
        print(f"\n-- Statement {i}")
        print(stmt)

print("\n" + "="*60)
print("After running the migration, execute verify_migration.py")
print("="*60)

# Save individual statements for easier execution
with open('migration_statements.txt', 'w', encoding='utf-8') as f:
    f.write("SQL Migration Statements\n")
    f.write("="*60 + "\n\n")
    for i, stmt in enumerate(statements, 1):
        if stmt.strip():
            f.write(f"-- Statement {i}\n")
            f.write(stmt + "\n\n")

print("\nSQL statements saved to: migration_statements.txt")
