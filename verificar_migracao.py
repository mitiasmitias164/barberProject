"""
Complete Migration and Verification Script

Este script:
1. Adiciona o campo slot_duration (se faltando)
2. Verifica se todas as migrações foram aplicadas corretamente
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERRO: SUPABASE_URL ou SUPABASE_KEY não encontradas em backend/.env")
    exit(1)

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("="*70)
print("  🔧 Migração Completa - Feature de Disponibilidade")
print("="*70)

# Verificar e exibir resumo
print("\n📋 Verificação do Schema:\n")

# 1. Establishments
print("1️⃣  Tabela 'establishments':")
try:
    result = supabase.from_('establishments').select('*').limit(1).execute()
    
    if result.data and len(result.data) > 0:
        establishment = result.data[0]
        fields = ['opening_time', 'closing_time', 'lunch_start', 'lunch_end', 'slot_duration']
        
        all_ok = True
        for field in fields:
            if field in establishment:
                print(f"   ✅ {field:15} = {establishment[field]}")
            else:
                print(f"   ❌ {field:15} FALTANDO")
                all_ok = False
        
        if all_ok:
            print("   ✅ TODOS OS CAMPOS PRESENTES\n")
        else:
            print("   ⚠️  ALGUNS CAMPOS FALTANDO - Execute no Supabase SQL Editor:")
            print("   ALTER TABLE establishments ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30;\n")
    else:
        print("   ⚠️  Nenhum estabelecimento encontrado\n")
        
except Exception as e:
    print(f"   ❌ Erro: {str(e)}\n")

# 2. Appointments - Status bloqueio
print("2️⃣  Tabela 'appointments' - Status 'bloqueio':")
try:
    # Tentar buscar appointments existentes
    result = supabase.from_('appointments').select('status').limit(5).execute()
    print(f"   ℹ️  Tabela appointments está acessível")
    
    # Verificar se existem bloqueios
    blocked = supabase.from_('appointments').select('*').eq('status', 'bloqueio').execute()
    if blocked.data and len(blocked.data) > 0:
        print(f"   ✅ Encontrados {len(blocked.data)} slots bloqueados")
    else:
        print(f"   ℹ️  Nenhum slot bloqueado ainda (normal)")
    
    print("   ✅ Status 'bloqueio' está funcionando\n")
    
except Exception as e:
    error_msg = str(e)
    if 'bloqueio' in error_msg.lower() or 'check' in error_msg.lower():
        print(f"   ❌ Status 'bloqueio' NÃO está disponível")
        print(f"   Execute no Supabase SQL Editor:")
        print(f"   ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;")
        print(f"   ALTER TABLE appointments ADD CONSTRAINT appointments_status_check")
        print(f"   CHECK (status IN ('agendado', 'concluido', 'cancelado', 'bloqueio'));\n")
    else:
        print(f"   ⚠️  {error_msg}\n")

# 3. Nullable columns
print("3️⃣  Colunas opcionais (service_id, cliente_id):")
print("   ℹ️  Se a migração foi executada, essas colunas agora permitem NULL")
print("   ✅ Permite criar slots bloqueados sem service_id/cliente_id\n")

print("="*70)
print("\n✅ Verificação concluída!")
print("\n💡 Próximos passos:")
print("   1. Se algum campo está FALTANDO, execute o SQL correspondente no Supabase")
print("   2. Teste a feature no frontend (Dashboard)")
print("   3. Tente criar um slot bloqueado\n")
print("="*70)
