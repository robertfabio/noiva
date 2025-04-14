import type { NextApiRequest, NextApiResponse } from 'next';
import { registerUser } from '@/lib/vercel/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { email, password, displayName } = req.body;

    // Validar entrada
    if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'Email, senha e nome são obrigatórios' });
    }

    // Validações adicionais
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // Tentar registrar usuário
    const user = await registerUser(email, password, displayName);

    // Retornar dados do usuário
    return res.status(201).json({ user });
  } catch (error) {
    console.error('Erro no registro:', error);
    
    if (error instanceof Error && error.message === 'Email já cadastrado') {
      return res.status(409).json({ message: 'Email já está em uso' });
    }
    
    return res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
} 