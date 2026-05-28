# TO Gestor Web — Guia de Configuração

## Pré-requisitos

- Conta gratuita no [Supabase](https://supabase.com)
- Conta no [GitHub](https://github.com) (para deploy)
- Node.js 18+ e pnpm instalados localmente

---

## 1. Configurar o Supabase

### 1.1 Criar o projeto

1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Escolha um nome (ex: `to-gestor`) e uma senha forte para o banco
3. Selecione a região mais próxima (ex: **South America (São Paulo)**)
4. Aguarde o projeto ser criado (~2 minutos)

### 1.2 Criar o banco de dados

1. No painel do Supabase, acesse **SQL Editor**
2. Clique em **New query**
3. Cole todo o conteúdo do arquivo `supabase/schema.sql`
4. Clique em **Run** (ou Ctrl+Enter)
5. Verifique se todas as tabelas foram criadas em **Table Editor**

### 1.3 Criar o primeiro usuário (Administrador)

1. No Supabase, acesse **Authentication > Users**
2. Clique em **Add user > Create new user**
3. Preencha e-mail e senha do administrador
4. Copie o **UUID** do usuário criado
5. Volte ao **SQL Editor** e execute:

```sql
-- Substitua os valores abaixo:
INSERT INTO public.clinicas (nome, email, telefone)
VALUES ('Nome da Sua Clínica', 'contato@clinica.com', '(11) 3000-0000')
RETURNING id;

-- Use o ID retornado acima:
UPDATE public.usuarios
SET clinica_id = 'ID_DA_CLINICA_RETORNADO',
    perfil = 'admin',
    nome = 'Seu Nome Completo'
WHERE id = 'UUID_DO_USUARIO_CRIADO';
```

### 1.4 Obter as credenciais da API

1. Acesse **Project Settings > API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 2. Configurar o projeto local

```bash
# Clone o repositório
git clone https://github.com/mastersfurios-max/to-gestor-web.git
cd to-gestor-web

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Inicie o servidor de desenvolvimento
pnpm dev
```

---

## 3. Deploy no GitHub Pages

### 3.1 Configurar o vite.config.ts

Adicione o `base` com o nome do seu repositório:

```ts
// vite.config.ts
export default defineConfig({
  base: '/to-gestor-web/',  // nome do repositório no GitHub
  plugins: [react(), tailwindcss()],
  server: { allowedHosts: true },
})
```

### 3.2 Criar o arquivo de workflow do GitHub Actions

Crie o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install
      - run: pnpm build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 3.3 Configurar os Secrets no GitHub

1. No repositório GitHub, acesse **Settings > Secrets and variables > Actions**
2. Adicione os secrets:
   - `VITE_SUPABASE_URL` — URL do projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` — chave anon do Supabase

### 3.4 Ativar o GitHub Pages

1. Acesse **Settings > Pages**
2. Em **Source**, selecione **Deploy from a branch**
3. Selecione a branch `gh-pages`
4. Salve

Após o primeiro push para `main`, o GitHub Actions fará o build e deploy automaticamente.

---

## 4. Perfis de acesso

| Perfil | Acesso |
|---|---|
| **Administrador** | Tudo: pacientes, agenda, clínico, financeiro, sugestões, painel de administração (usuários e clínica) |
| **Terapeuta** | Pacientes, agenda (próprios atendimentos), clínico, financeiro (próprias cobranças), sugestões |
| **Secretária** | Pacientes, agenda (todos os atendimentos), financeiro (todas as cobranças) |

---

## 5. Adicionar novos usuários

Após configurar o sistema, o administrador pode adicionar novos usuários diretamente pelo painel:

1. Acesse **Administração** no menu lateral (visível apenas para admins)
2. Clique em **Novo Usuário**
3. Preencha nome, e-mail, senha e perfil
4. O usuário será criado e associado automaticamente à clínica

---

## Suporte

Em caso de dúvidas sobre a configuração do Supabase, consulte a [documentação oficial](https://supabase.com/docs).
