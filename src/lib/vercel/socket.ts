import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';
import type { Server as IOServer } from 'socket.io';

// Definição de tipos
export interface SocketUser {
  id: string;
  name: string;
  photoURL?: string;
  isHost: boolean;
  socketId: string;
  roomId: string;
}

export interface SocketServer extends HTTPServer {
  io?: IOServer | null;
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export const initSocketServer = (res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket já está inicializado');
    return res.socket.server.io;
  }
  
  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    socket.on('join-room', (data) => {
      const { roomId, userId, userName, photoURL, isHost } = data;
      
      console.log(`Usuário ${userName} entrou na sala ${roomId}`);
      socket.join(roomId);
      
      // Adicionar usuário à lista de usuários da sala
      const room = io.sockets.adapter.rooms.get(roomId);
      const users: SocketUser[] = [];
      
      if (room) {
        // Para cada socket na sala, obter dados do usuário
        room.forEach((socketId) => {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket && clientSocket.data.user) {
            users.push(clientSocket.data.user as SocketUser);
          }
        });
      }
      
      // Salvar dados do usuário no socket
      socket.data.user = {
        id: userId,
        name: userName,
        photoURL: photoURL,
        isHost: isHost,
        socketId: socket.id,
        roomId: roomId
      };
      
      users.push(socket.data.user as SocketUser);
      
      // Enviar lista atualizada para todos na sala
      io.to(roomId).emit('users-update', users);
    });
    
    socket.on('leave-room', (data) => {
      const { roomId } = data;
      socket.leave(roomId);
      
      // Atualizar lista de usuários
      const room = io.sockets.adapter.rooms.get(roomId);
      const users: SocketUser[] = [];
      
      if (room) {
        room.forEach((socketId) => {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket && clientSocket.data.user) {
            users.push(clientSocket.data.user as SocketUser);
          }
        });
        
        // Se o host saiu, atribuir novo host
        const hasHost = users.some(user => user.isHost);
        if (!hasHost && users.length > 0) {
          const newHost = users[0];
          newHost.isHost = true;
          
          const hostSocket = io.sockets.sockets.get(newHost.socketId);
          if (hostSocket) {
            hostSocket.data.user.isHost = true;
            io.to(newHost.socketId).emit('host-update', { isHost: true });
          }
        }
        
        io.to(roomId).emit('users-update', users);
      }
    });
    
    socket.on('video-action', (data) => {
      const { roomId, action, value } = data;
      
      // Redirecionar ação para todos na sala exceto o emissor
      socket.to(roomId).emit('video-action', { type: action, value });
    });
    
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
      
      // Se o usuário estava em uma sala, removê-lo
      if (socket.data.user && socket.data.user.roomId) {
        const roomId = socket.data.user.roomId;
        
        // Atualizar lista de usuários
        const room = io.sockets.adapter.rooms.get(roomId);
        const users: SocketUser[] = [];
        
        if (room) {
          room.forEach((socketId) => {
            const clientSocket = io.sockets.sockets.get(socketId);
            if (clientSocket && clientSocket.data.user) {
              users.push(clientSocket.data.user as SocketUser);
            }
          });
          
          // Se o host saiu, atribuir novo host
          const hasHost = users.some(user => user.isHost);
          if (!hasHost && users.length > 0) {
            const newHost = users[0];
            newHost.isHost = true;
            
            const hostSocket = io.sockets.sockets.get(newHost.socketId);
            if (hostSocket) {
              hostSocket.data.user.isHost = true;
              io.to(newHost.socketId).emit('host-update', { isHost: true });
            }
          }
          
          io.to(roomId).emit('users-update', users);
        }
      }
    });
  });
  
  res.socket.server.io = io;
  return io;
}; 