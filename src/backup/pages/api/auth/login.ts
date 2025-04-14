import type { NextApiRequest, NextApiResponse } from 'next';
import { loginUser } from '@/lib/vercel/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Formato de dados inválido' });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Formato de email inválido' });
    }

    // Tentar fazer login
    const result = await loginUser(email, password);

    // Retornar token e dados do usuário
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro no login:', error);
    
    // Mensagens de erro específicas
    if (error.message === 'Usuário não encontrado') {
      return res.status(401).json({ message: 'Email não cadastrado' });
    }
    
    if (error.message === 'Senha incorreta') {
      return res.status(401).json({ message: 'Senha incorreta' });
    }
    
    // Erro genérico
    return res.status(500).json({ message: 'Erro ao fazer login. Tente novamente.' });
  }
} 