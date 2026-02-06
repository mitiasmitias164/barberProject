# BarberManager

Sistema de gerenciamento para barbearia, composto por API em Python e Frontend PWA em React.

## Estrutura do Projeto

- `/backend`: API construída com FastAPI e gerenciada pelo `uv`.
- `/frontend`: Aplicação PWA construída com React, TypeScript e Vite.
- `supabase_schema.sql`: Script SQL para criação do banco de dados no Supabase.

## Pré-requisitos

- Python (com `uv` instalado)
- Node.js & npm

## Configuração

### Backend

1. Navegue até a pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências (automático ao rodar):
   ```bash
   uv sync
   ```
3. Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:
   ```env
   SUPABASE_URL=seu_supabase_url
   SUPABASE_KEY=sua_supabase_key
   ```
   *(Adicione variáveis para n8n se necessário: `N8N_WEBHOOK_URL` etc.)*

4. Execute o servidor:
   ```bash
   uv run uvicorn main:app --reload
   ```
   Acesse: `http://localhost:8000/docs`

### Frontend

1. Navegue até a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:5173`

## Banco de Dados

Execute o script `supabase_schema.sql` no Editor SQL do seu projeto Supabase para criar as tabelas necessárias e configurar as regras de conflito de horário.
