-- Schema for Supabase project
-- Run this SQL in the Supabase SQL editor

-- Garantir que as extensões necessárias estejam instaladas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se a tabela profiles existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles') THEN
        -- Criar tabela profiles
        CREATE TABLE profiles (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Comentários para as colunas
        COMMENT ON TABLE profiles IS 'Tabela de perfis de usuários';
        COMMENT ON COLUMN profiles.id IS 'ID único do usuário (mesmo ID da Auth do Supabase)';
        COMMENT ON COLUMN profiles.email IS 'Email do usuário';
        COMMENT ON COLUMN profiles.name IS 'Nome do usuário';
        COMMENT ON COLUMN profiles.avatar_url IS 'URL da foto de perfil do usuário';
        COMMENT ON COLUMN profiles.created_at IS 'Data de criação do perfil';
        COMMENT ON COLUMN profiles.updated_at IS 'Data da última atualização do perfil';

        -- Adicionar permissões de RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Criar políticas de acesso
        CREATE POLICY "Os usuários podem visualizar seus próprios perfis"
            ON profiles FOR SELECT
            USING (auth.uid() = id);

        CREATE POLICY "Os usuários podem atualizar seus próprios perfis"
            ON profiles FOR UPDATE
            USING (auth.uid() = id);

        -- Permitir que o serviço de autenticação acesse a tabela
        CREATE POLICY "O serviço pode fazer tudo"
            ON profiles FOR ALL
            TO service_role
            USING (true);
    END IF;
END
$$;

-- Verificar se a tabela rooms existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'rooms') THEN
        -- Criar tabela rooms
        CREATE TABLE rooms (
            id TEXT PRIMARY KEY,
            hostId UUID NOT NULL REFERENCES profiles(id),
            hostName TEXT,
            videoUrl TEXT,
            videoTitle TEXT,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            lastActive TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Comentários para as colunas
        COMMENT ON TABLE rooms IS 'Tabela de salas de vídeo';
        COMMENT ON COLUMN rooms.id IS 'ID único da sala';
        COMMENT ON COLUMN rooms.hostId IS 'ID do usuário host da sala';
        COMMENT ON COLUMN rooms.hostName IS 'Nome do host da sala';
        COMMENT ON COLUMN rooms.videoUrl IS 'URL do vídeo sendo assistido';
        COMMENT ON COLUMN rooms.videoTitle IS 'Título do vídeo';
        COMMENT ON COLUMN rooms.createdAt IS 'Data de criação da sala';
        COMMENT ON COLUMN rooms.lastActive IS 'Data da última atividade na sala';

        -- Adicionar permissões de RLS
        ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

        -- Criar políticas de acesso
        CREATE POLICY "Qualquer um pode visualizar salas"
            ON rooms FOR SELECT
            USING (true);

        CREATE POLICY "Hosts podem atualizar suas salas"
            ON rooms FOR UPDATE
            USING (auth.uid() = hostId);

        CREATE POLICY "Qualquer usuário logado pode criar salas"
            ON rooms FOR INSERT
            WITH CHECK (auth.uid() IS NOT NULL);

        CREATE POLICY "Hosts podem deletar suas salas"
            ON rooms FOR DELETE
            USING (auth.uid() = hostId);

        -- Permitir que o serviço acesse a tabela
        CREATE POLICY "O serviço pode fazer tudo com salas"
            ON rooms FOR ALL
            TO service_role
            USING (true);
    END IF;
END
$$;

-- Verificar se a tabela user_rooms existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_rooms') THEN
        -- Criar tabela user_rooms
        CREATE TABLE user_rooms (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            userId UUID NOT NULL REFERENCES profiles(id),
            roomId TEXT NOT NULL REFERENCES rooms(id),
            isHost BOOLEAN DEFAULT false,
            lastVisited TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(userId, roomId)
        );

        -- Comentários para as colunas
        COMMENT ON TABLE user_rooms IS 'Relacionamento entre usuários e salas';
        COMMENT ON COLUMN user_rooms.id IS 'ID único do relacionamento';
        COMMENT ON COLUMN user_rooms.userId IS 'ID do usuário';
        COMMENT ON COLUMN user_rooms.roomId IS 'ID da sala';
        COMMENT ON COLUMN user_rooms.isHost IS 'Indica se o usuário é o host da sala';
        COMMENT ON COLUMN user_rooms.lastVisited IS 'Data da última visita do usuário à sala';

        -- Adicionar permissões de RLS
        ALTER TABLE user_rooms ENABLE ROW LEVEL SECURITY;

        -- Criar políticas de acesso
        CREATE POLICY "Usuários podem ver seus próprios registros"
            ON user_rooms FOR SELECT
            USING (auth.uid() = userId);

        CREATE POLICY "Usuários podem inserir seus próprios registros"
            ON user_rooms FOR INSERT
            WITH CHECK (auth.uid() = userId);

        CREATE POLICY "Usuários podem atualizar seus próprios registros"
            ON user_rooms FOR UPDATE
            USING (auth.uid() = userId);

        -- Permitir que o serviço acesse a tabela
        CREATE POLICY "O serviço pode fazer tudo com user_rooms"
            ON user_rooms FOR ALL
            TO service_role
            USING (true);
    END IF;
END
$$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rooms_hostId ON public.rooms(hostId);

-- Create user_rooms junction table to track room history
CREATE TABLE IF NOT EXISTS public.user_rooms (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  roomId TEXT NOT NULL,
  isHost BOOLEAN DEFAULT false,
  lastVisited TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user
    FOREIGN KEY(userId)
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_room
    FOREIGN KEY(roomId)
    REFERENCES public.rooms(id)
    ON DELETE CASCADE,
    
  CONSTRAINT unique_user_room UNIQUE(userId, roomId)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_rooms_userId ON public.user_rooms(userId);
CREATE INDEX IF NOT EXISTS idx_user_rooms_roomId ON public.user_rooms(roomId);

-- Create RLS policies for security

-- Rooms table policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read rooms
CREATE POLICY "Anyone can read rooms"
  ON public.rooms FOR SELECT
  USING (true);

-- Only the host can update their rooms
CREATE POLICY "Host can update own rooms"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = hostId);

-- Only the host can delete their rooms
CREATE POLICY "Host can delete own rooms"
  ON public.rooms FOR DELETE
  USING (auth.uid() = hostId);

-- Any authenticated user can create rooms
CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- user_rooms table policies
ALTER TABLE public.user_rooms ENABLE ROW LEVEL SECURITY;

-- Users can only see their own room history
CREATE POLICY "Users can read their own room history"
  ON public.user_rooms FOR SELECT
  USING (auth.uid() = userId);

-- Users can update their own room history
CREATE POLICY "Users can update their own room history"
  ON public.user_rooms FOR UPDATE
  USING (auth.uid() = userId);

-- Users can delete their own room history
CREATE POLICY "Users can delete their own room history"
  ON public.user_rooms FOR DELETE
  USING (auth.uid() = userId);

-- Users can create their own room history
CREATE POLICY "Users can create their own room history"
  ON public.user_rooms FOR INSERT
  WITH CHECK (auth.uid() = userId);

-- Give service role access to all tables
GRANT ALL ON public.rooms TO service_role;
GRANT ALL ON public.user_rooms TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role; 