# Sr. RH

Sistema interno de gestão de RH para a rede de óticas. Next.js (App Router) +
TypeScript + Tailwind, com Supabase (Postgres + Auth + RLS) como backend,
Google Drive para arquivos e Evolution API para notificações via WhatsApp.

## Setup local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um projeto no [Supabase](https://supabase.com) e copie `.env.local.example` para `.env.local`, preenchendo:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — em Project Settings → API
   - `GOOGLE_DRIVE_*` — credenciais da service account e o ID da pasta raiz no Drive
   - `EVOLUTION_API_*` — URL, chave e nome da instância da Evolution API já existente

3. Aplique as migrations em `supabase/migrations/` no projeto Supabase (via SQL Editor ou `supabase db push` com o [Supabase CLI](https://supabase.com/docs/guides/cli)).

4. Crie o primeiro usuário de RH em Authentication → Users no painel do Supabase (email/senha). O trigger em `20260817000002_roles_and_profiles.sql` cria automaticamente o perfil com a role `rh_admin`.

5. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000) — você será redirecionado para `/login`.

## Estrutura

- `src/app/(protected)/` — telas que exigem login (redirecionamento cuidado pelo middleware)
- `src/app/login/` — tela de login
- `src/lib/supabase/` — clientes Supabase (browser, server, middleware)
- `supabase/migrations/` — schema versionado do banco (enums, tabelas, RLS)

## Deploy

Deploy é feito via [Vercel](https://vercel.com), conectado ao repositório no GitHub. Configure as mesmas variáveis de ambiente do `.env.local` em Project Settings → Environment Variables na Vercel.
