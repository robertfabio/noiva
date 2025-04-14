# Noiva - Plataforma para Assistir em Sincronia

Noiva é uma aplicação web para casais assistirem a filmes juntos enquanto estão separados geograficamente. A plataforma sincroniza o player de vídeo entre os usuários e oferece chat em tempo real para interação.

![Noiva Screenshot](screenshot.png)

## Funcionalidades Principais

- **Autenticação de Usuários**: Login seguro com Supabase Auth
- **Salas Privadas**: Cada sala tem um código único para acesso exclusivo
- **Upload de Vídeos**: Faça upload dos seus filmes favoritos ou use links externos
- **Sincronização em Tempo Real**: Quando um usuário pausa ou dá play, todos na sala veem a mesma ação
- **Chat Integrado**: Converse durante o filme sem sair da plataforma
- **Catálogo de Filmes**: Escolha filmes de um catálogo compartilhado

## Tecnologias Utilizadas

- **Frontend**:
  - Next.js 15
  - React 19
  - TypeScript
  - Chakra UI
  - TailwindCSS
  - Socket.io Client

- **Backend/Serviços**:
  - Next.js API Routes
  - Supabase (Auth, Database, Storage)
  - Vercel Blob Storage (para vídeos)
  - Socket.io (para sincronização em tempo real)

A sincronização do player entre os usuários é feita usando Socket.io:

1. O servidor Socket.io (`/pages/api/socket.ts`) mantém o estado de cada sala
2. O host controla o player (play, pause, seek)
3. Quando o host realiza uma ação, o evento é enviado para o servidor
4. O servidor propaga o evento para todos os outros usuários na sala
5. Os players dos usuários recebem o evento e se sincronizam automaticamente

Principais eventos implementados:
- `join-room`: Quando um usuário entra em uma sala
- `video-action`: Quando o player é iniciado, pausado ou alterado
- `users-update`: Atualização da lista de usuários na sala
- `host-update`: Alteração do host da sala
- `leave-room`: Quando um usuário sai da sala

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18 ou superior
- Conta na Vercel
- Conta no Supabase

### Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="seu_token_do_vercel_blob"

# JWT Secret para tokens de autenticação
JWT_SECRET="sua_chave_secreta_jwt"

# URL base da aplicação
VERCEL_URL="http://localhost:3000"

# Configurações do Supabase
SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_chave_anon_do_supabase"
SUPABASE_SERVICE_ROLE_KEY="sua_chave_service_role_do_supabase"
SUPABASE_JWT_SECRET="seu_jwt_secret_do_supabase"

# Configurações do PostgreSQL (via Supabase)
POSTGRES_URL="sua_url_de_conexao_postgres"
POSTGRES_PRISMA_URL="sua_url_de_conexao_para_prisma"
POSTGRES_URL_NON_POOLING="sua_url_sem_pooling"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="sua_senha_postgres"
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="seu_host_postgres.supabase.co"
```

### Configuração do Banco de Dados

Para configurar o banco de dados, acesse:

```
http://localhost:3000/api/setup
```

Essa rota verificará quais tabelas estão faltando e fornecerá os comandos SQL necessários para criá-las no painel SQL do Supabase.

## Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Na seção "Settings > API", copie as credenciais para o seu arquivo `.env.local`
4. Habilite o Auth e configure os provedores de autenticação desejados (email/senha, Google, etc.)
5. Use os comandos SQL fornecidos pela rota `/api/setup` para criar as tabelas necessárias

## Deploy na Vercel

Para fazer o deploy na Vercel, siga os seguintes passos:

1. Instale a CLI da Vercel:
```bash
npm install -g vercel
```

2. Faça login na Vercel:
```bash
vercel login
```

3. Configure as variáveis de ambiente na Vercel (copie do seu arquivo `.env.local`)

4. Deploy do projeto:
```bash
vercel
```

## Estrutura do Projeto

```
noiva/
├── src/
│   ├── app/                # Rotas da aplicação (Next.js App Router)
│   │   ├── auth/           # Páginas de autenticação
│   │   ├── room/           # Páginas de salas
│   │   ├── profile/        # Páginas de perfil
│   │   ├── api/            # API Routes
│   │   └── about/          # Página sobre
│   ├── components/         # Componentes React reutilizáveis
│   ├── hooks/              # Hooks personalizados
│   │   └── useAuth.tsx     # Hook de autenticação com Supabase
│   ├── lib/                # Bibliotecas e configurações
│   │   ├── supabase.ts     # Cliente Supabase
│   │   └── catalog.ts      # Catálogo de filmes
├── public/                 # Arquivos públicos
└── ...                     # Arquivos de configuração
```

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:3000`.
