"""Simple verification - no threading"""
import os
import sys

# Suppress warnings
import warnings
warnings.filterwarnings('ignore')

from supabase import create_client
from dotenv import load_dotenv

load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("="*70)
print("  VERIFICAÇÃO DA MIGRAÇÃO - Feature de Disponibilidade")
print("="*70)
print()

# Check establishments
print("1. Tabela 'establishments':")
try:
    result = supabase.from_('establishments').select('*').limit(1).execute()
    
    if result.data:
        est = result.data[0]
        fields = {
            'opening_time': '✅' if 'opening_time' in est else '❌ FALTANDO',
            'closing_time': '✅' if 'closing_time' in est else '❌ FALTANDO',
            'lunch_start': '✅' if 'lunch_start' in est else '❌ FALTANDO',
            'lunch_end': '✅' if 'lunch_end' in est else '❌ FALTANDO',
            'slot_duration': '✅' if 'slot_duration' in est else '❌ FALTANDO'
        }
        
        for field, status in fields.items():
            if '✅' in status:
                value = est.get(field, 'N/A')
                print(f"   {status} {field:15} = {value}")
            else:
                print(f"   {status} {field}")
        
        all_ok = all('✅' in s for s in fields.values())
        if all_ok:
            print("   ✅ TODOS OS CAMPOS OK!")
        else:
            print("   ⚠️  Execute no Supabase:")
            print("      ALTER TABLE establishments ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30;")
    else:
        print("   ⚠️  Nenhum estabelecimento no banco")
except Exception as e:
    print(f"   ❌ Erro: {e}")

print()

# Check appointments
print("2. Tabela 'appointments' - Status 'bloqueio':")
try:
    result = supabase.from_('appointments').select('*').eq('status', 'bloqueio').limit(1).execute()
    print("   ✅ Status 'bloqueio' está disponível")
    
    if result.data:
        print(f"   ℹ️  {len(result.data)} slots bloqueados existem")
    else:
        print("   ℹ️  Nenhum slot bloqueado ainda (normal)")
except Exception as e:
    if 'bloqueio' in str(e).lower() or 'check' in str(e).lower():
        print("   ❌ Status 'bloqueio' NÃO disponível")
        print("   Execute no Supabase:")
        print("      ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;")
        print("      ALTER TABLE appointments ADD CONSTRAINT appointments_status_check")
        print("      CHECK (status IN ('agendado', 'concluido', 'cancelado', 'bloqueio'));")
    else:
        print(f"   ℹ️  {e}")

print()
print("="*70)
print("  ✅ Verificação Concluída!")
print("="*70)
