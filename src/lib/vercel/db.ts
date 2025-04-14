import { createClient } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export interface Room {
  id: string;
  hostId: string;
  hostName: string;
  videoUrl: string;
  videoTitle: string;
  createdAt: Date;
  lastActive: Date;
}

export interface Message {
  id: string;
  roomId: string;
  text: string;
  user: {
    id: string;
    name: string;
    photoURL?: string;
  };
  timestamp: number;
}

// Cliente DB
export const getClient = () => {
  return createClient();
};

// Inicializar tabelas
export const initializeDatabase = async () => {
  let client;
  
  try {
    client = getClient();
    
    // Criar tabela de salas
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(255) PRIMARY KEY,
        host_id VARCHAR(255) NOT NULL,
        host_name VARCHAR(255) NOT NULL,
        video_url TEXT,
        video_title TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela de mensagens
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        room_id VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_photo_url TEXT,
        timestamp BIGINT NOT NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )
    `);
    
    // Criar tabela de estatísticas do usuário
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id VARCHAR(255) PRIMARY KEY,
        recent_rooms JSONB DEFAULT '[]',
        hosted_rooms JSONB DEFAULT '[]',
        FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
      )
    `);
    
    // O Vercel Postgres Client gerencia automaticamente as conexões, não precisamos fechá-las
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
};

// Salas
export const createRoom = async (hostId: string, hostName: string) => {
  let client;
  
  try {
    client = getClient();
    
    const roomId = nanoid(10);
    
    await client.query(
      `INSERT INTO rooms (id, host_id, host_name) VALUES ($1, $2, $3)`,
      [roomId, hostId, hostName]
    );
    
    // Adicionar sala às estatísticas do usuário
    await updateUserStats(hostId, roomId, true);
    
    return roomId;
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    throw error;
  }
};

export const getRoom = async (roomId: string) => {
  let client;
  
  try {
    client = getClient();
    
    const result = await client.query(
      `SELECT * FROM rooms WHERE id = $1`,
      [roomId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const room = result.rows[0];
    
    return {
      id: room.id,
      hostId: room.host_id,
      hostName: room.host_name,
      videoUrl: room.video_url || '',
      videoTitle: room.video_title || '',
      createdAt: room.created_at,
      lastActive: room.last_active
    };
  } catch (error) {
    console.error('Erro ao buscar sala:', error);
    return null;
  }
};

export const updateRoom = async (roomId: string, data: Partial<Room>) => {
  const client = getClient();
  
  try {
    const updates = [];
    const values = [];
    let counter = 1;
    
    if (data.videoUrl !== undefined) {
      updates.push(`video_url = $${counter}`);
      values.push(data.videoUrl);
      counter++;
    }
    
    if (data.videoTitle !== undefined) {
      updates.push(`video_title = $${counter}`);
      values.push(data.videoTitle);
      counter++;
    }
    
    // Sempre atualizar last_active
    updates.push(`last_active = CURRENT_TIMESTAMP`);
    
    if (updates.length === 0) {
      return true;
    }
    
    values.push(roomId);
    
    await client.query(
      `UPDATE rooms SET ${updates.join(', ')} WHERE id = $${counter}`,
      values
    );
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    return false;
  }
};

// Mensagens
export const addMessage = async (roomId: string, text: string, user: { id: string, name: string, photoURL?: string }) => {
  const client = getClient();
  
  try {
    const messageId = nanoid();
    const timestamp = Date.now();
    
    await client.query(
      `INSERT INTO messages (id, room_id, text, user_id, user_name, user_photo_url, timestamp) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [messageId, roomId, text, user.id, user.name, user.photoURL || null, timestamp]
    );
    
    return {
      id: messageId,
      roomId,
      text,
      user,
      timestamp
    };
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    throw error;
  }
};

export const getMessages = async (roomId: string) => {
  const client = getClient();
  
  try {
    const result = await client.query(
      `SELECT * FROM messages WHERE room_id = $1 ORDER BY timestamp ASC`,
      [roomId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      roomId: row.room_id,
      text: row.text,
      user: {
        id: row.user_id,
        name: row.user_name,
        photoURL: row.user_photo_url
      },
      timestamp: row.timestamp
    }));
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return [];
  }
};

// Estatísticas do usuário
export const updateUserStats = async (userId: string, roomId: string, isHost: boolean) => {
  const client = getClient();
  
  try {
    // Verificar se o usuário já tem estatísticas
    const userStats = await client.query(
      `SELECT * FROM user_stats WHERE user_id = $1`,
      [userId]
    );
    
    if (userStats.rows.length === 0) {
      // Criar novo registro
      const recentRooms = [roomId];
      const hostedRooms = isHost ? [roomId] : [];
      
      await client.query(
        `INSERT INTO user_stats (user_id, recent_rooms, hosted_rooms) VALUES ($1, $2, $3)`,
        [userId, JSON.stringify(recentRooms), JSON.stringify(hostedRooms)]
      );
    } else {
      // Atualizar registro existente
      let recentRooms = JSON.parse(userStats.rows[0].recent_rooms);
      let hostedRooms = JSON.parse(userStats.rows[0].hosted_rooms);
      
      // Adicionar à lista de salas recentes
      recentRooms = [roomId, ...recentRooms.filter((id: string) => id !== roomId)].slice(0, 10);
      
      // Se for host, adicionar à lista de salas hospedadas
      if (isHost) {
        hostedRooms = [roomId, ...hostedRooms.filter((id: string) => id !== roomId)];
      }
      
      await client.query(
        `UPDATE user_stats SET recent_rooms = $1, hosted_rooms = $2 WHERE user_id = $3`,
        [JSON.stringify(recentRooms), JSON.stringify(hostedRooms), userId]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do usuário:', error);
    return false;
  }
};

export const getUserStats = async (userId: string) => {
  const client = getClient();
  
  try {
    const result = await client.query(
      `SELECT * FROM user_stats WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return {
        recentRooms: [],
        hostedRooms: []
      };
    }
    
    return {
      recentRooms: JSON.parse(result.rows[0].recent_rooms),
      hostedRooms: JSON.parse(result.rows[0].hosted_rooms)
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    return {
      recentRooms: [],
      hostedRooms: []
    };
  }
}; 