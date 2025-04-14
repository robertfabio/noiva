import type { NextApiRequest, NextApiResponse } from 'next';
import { getRoom, updateRoom } from '@/lib/vercel/db';
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
      return getHandler(roomId, req, res);
    case 'PATCH':
    case 'PUT':
      return updateHandler(roomId, req, res);
    default:
      return res.status(405).json({ message: 'Método não permitido' });
  }
}

// GET - Obter sala
async function getHandler(roomId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const room = await getRoom(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Sala não encontrada' });
    }
    
    return res.status(200).json(room);
  } catch (error) {
    console.error('Erro ao obter sala:', error);
    return res.status(500).json({ message: 'Erro ao obter sala' });
  }
}

// PUT/PATCH - Atualizar sala
async function updateHandler(roomId: string, req: NextApiRequest, res: NextApiResponse) {
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
      
      // Verificar se sala existe
      const room = await getRoom(roomId);
      
      if (!room) {
        return res.status(404).json({ message: 'Sala não encontrada' });
      }
      
      // Verificar se usuário é o host da sala
      if (room.hostId !== user.uid) {
        return res.status(403).json({ message: 'Apenas o host pode atualizar a sala' });
      }
      
      // Atualizar sala
      const success = await updateRoom(roomId, req.body);
      
      if (!success) {
        return res.status(500).json({ message: 'Erro ao atualizar sala' });
      }
      
      const updatedRoom = await getRoom(roomId);
      
      return res.status(200).json(updatedRoom);
    } catch {
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    return res.status(500).json({ message: 'Erro ao atualizar sala' });
  }
} 