import type { NextApiRequest, NextApiResponse } from 'next';
import { getMessages, addMessage } from '@/lib/vercel/db';
import { getUserById, verifyToken } from '@/lib/vercel/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const roomId = id as string;

  // Tratamento para cada método HTTP
  switch (req.method) {
    case 'GET':
      return getMessagesHandler(roomId, req, res);
    case 'POST':
      return addMessageHandler(roomId, req, res);
    default:
      return res.status(405).json({ message: 'Método não permitido' });
  }
}

// GET - Obter mensagens da sala
async function getMessagesHandler(roomId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const messages = await getMessages(roomId);
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    return res.status(500).json({ message: 'Erro ao obter mensagens' });
  }
}

// POST - Adicionar nova mensagem
async function addMessageHandler(roomId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    // Obter token de autenticação
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autenticação obrigatório' });
    }
    
    const token = authHeader.substring(7);
    
    // Verificar token
    try {
      const payload = verifyToken(token) as { uid: string };
      
      // Buscar usuário
      const user = await getUserById(payload.uid);
      
      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }
      
      // Validar dados da mensagem
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: 'Texto da mensagem é obrigatório' });
      }
      
      // Adicionar mensagem
      const message = await addMessage(roomId, text, {
        id: user.uid,
        name: user.displayName || 'Anônimo',
        photoURL: user.photoURL
      });
      
      return res.status(201).json(message);
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    return res.status(500).json({ message: 'Erro ao adicionar mensagem' });
  }
} 