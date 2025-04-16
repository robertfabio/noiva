# Noiva

Aplicação para assistir vídeos em grupo com chat em tempo real.

## Stack

- Next.js 14
- TypeScript
- Supabase (Auth + DB)
- Socket.io
- Chakra UI
- Vercel (Deploy + Blob Storage)

## Desenvolvimento

```bash
git clone https://github.com/robertfabio/noiva.git
cd noiva
npm install
cp .env.example .env.local

# Dev server
npm run dev

# Socket.io server
npm run socket

# Ou ambos
npm run dev:full
```

## Variáveis de Ambiente (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BLOB_READ_WRITE_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Features

- Login com Google
- Criação de salas
- Upload de vídeos
- Chat em tempo real
- Sincronização de vídeo entre usuários

## Pendências

- Sincronização de vídeo precisa de ajustes
- Reconexão do Socket.io instável
- Melhorar performance do player
- Implementar sistema de convites
