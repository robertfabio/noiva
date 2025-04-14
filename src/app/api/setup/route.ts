import { createServiceClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createServiceClient();
    
    // Listar todas as tabelas existentes
    const { data: tables, error: tableError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tableError) {
      return NextResponse.json(
        { error: 'Erro ao verificar tabelas existentes', details: tableError },
        { status: 500 }
      );
    }
    
    const tableNames = tables?.map(t => t.tablename) || [];
    
    // Verificar tabelas necessárias
    const requiredTables = [
      'profiles',
      'movie_playlists',
      'playlist_items',
      'watch_rooms'
    ];
    
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    // Retornar informações sobre a configuração do banco de dados
    return NextResponse.json(
      { 
        message: 'Verificação de banco de dados concluída!',
        tables_existentes: tableNames,
        tabelas_faltando: missingTables,
        instrucoes: missingTables.length > 0 
          ? 'Execute os comandos SQL abaixo no SQL Editor do Supabase para criar as tabelas necessárias:' 
          : 'Todas as tabelas necessárias já existem!',
        sql_commands: missingTables.length > 0 ? `
-- Criação de tabelas necessárias

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de playlists de filmes
CREATE TABLE IF NOT EXISTS movie_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de playlists
CREATE TABLE IF NOT EXISTS playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES movie_playlists(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  movie_title TEXT NOT NULL,
  poster_path TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(playlist_id, movie_id)
);

-- Tabela de salas de assistir juntos
CREATE TABLE IF NOT EXISTS watch_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  movie_title TEXT NOT NULL,
  room_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuração de Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_rooms ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela profiles
CREATE POLICY "Usuários podem ver seus próprios perfis" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);
  
CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Políticas para a tabela movie_playlists
CREATE POLICY "Usuários podem ver playlists públicas" 
  ON movie_playlists FOR SELECT 
  USING (is_public OR auth.uid() = user_id);
  
CREATE POLICY "Usuários podem gerenciar suas próprias playlists" 
  ON movie_playlists FOR ALL 
  USING (auth.uid() = user_id);

-- Políticas para a tabela playlist_items
CREATE POLICY "Usuários podem ver items de playlists públicas ou próprias" 
  ON playlist_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM movie_playlists 
      WHERE movie_playlists.id = playlist_items.playlist_id 
      AND (movie_playlists.is_public OR movie_playlists.user_id = auth.uid())
    )
  );
  
CREATE POLICY "Usuários podem gerenciar items de suas próprias playlists" 
  ON playlist_items FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM movie_playlists 
      WHERE movie_playlists.id = playlist_items.playlist_id 
      AND movie_playlists.user_id = auth.uid()
    )
  );

-- Políticas para a tabela watch_rooms
CREATE POLICY "Qualquer pessoa pode ver salas ativas" 
  ON watch_rooms FOR SELECT 
  USING (is_active = true);
  
CREATE POLICY "Hosts podem gerenciar suas próprias salas" 
  ON watch_rooms FOR ALL 
  USING (auth.uid() = host_id);
` : ''
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao verificar banco de dados', 
        details: error,
        mensagem: 'Execute manualmente os comandos SQL para configurar o banco de dados no SQL Editor do Supabase.' 
      },
      { status: 500 }
    );
  }
} 