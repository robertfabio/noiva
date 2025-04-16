import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, photoURL } = await request.json();
    
    if (!userId || !email) {
      return NextResponse.json({ error: 'ID do usuário e email são obrigatórios' }, { status: 400 });
    }
    
    const supabase = createServiceClient();
    
    // Verificar se o usuário já existe pelo ID
    const { data: existingUser, error: existingUserError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingUserError && !existingUserError.message.includes('No rows found')) {
      console.error('Erro ao verificar usuário existente:', existingUserError);
      return NextResponse.json({ error: 'Erro ao verificar usuário' }, { status: 500 });
    }
    
    const now = new Date().toISOString();
    
    if (existingUser) {
      // Atualizar usuário existente
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email,
          name: name || existingUser.name,
          avatar_url: photoURL || existingUser.avatar_url,
          updated_at: now,
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError);
        return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Usuário atualizado com sucesso',
        operation: 'update'
      });
    } else {
      // Criar novo usuário
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          name: name || 'Usuário',
          avatar_url: photoURL,
          created_at: now,
          updated_at: now,
        });
      
      if (insertError) {
        console.error('Erro ao criar usuário:', insertError);
        return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Usuário criado com sucesso',
        operation: 'insert'
      });
    }
  } catch (error) {
    console.error('Erro ao processar sincronização de usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 