import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/vercel/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { token } = req.body;

    // Validar entrada
    if (!token) {
      return res.status(400).json({ message: 'Token é obrigatório' });
    }

    // Verificar token
    const payload = verifyToken(token);

    // Retornar dados do token
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
} 