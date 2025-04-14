// Importações ESM
import http from 'http';
import { Server } from 'socket.io';

// Criar servidor HTTP
const server = http.createServer();

// Configurar o servidor Socket.io com CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://noiva-app.vercel.app' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Armazenar informações sobre as salas
const rooms = new Map();

// Escutar conexões de clientes
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  
  // Quando um usuário entra em uma sala
  socket.on('join-room', ({ roomId, userId, userName, photoURL, isHost }) => {
    console.log(`Usuário ${userName} (${userId}) entrou na sala ${roomId}`);
    
    // Adicionar socket à sala
    socket.join(roomId);
    
    // Inicializar sala se não existir
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        hostId: isHost ? userId : null,
        users: new Map(),
        videoState: {
          isPlaying: false,
          currentTime: 0,
          lastUpdate: Date.now()
        }
      });
    }
    
    const room = rooms.get(roomId);
    
    // Atualizar host se necessário
    if (isHost && !room.hostId) {
      room.hostId = userId;
    }
    
    // Adicionar usuário à sala
    room.users.set(userId, {
      id: userId,
      name: userName,
      photoURL,
      socketId: socket.id,
      isHost
    });
    
    // Enviar lista de usuários atualizada para todos na sala
    const usersList = Array.from(room.users.values());
    io.to(roomId).emit('users-update', usersList);
    
    // Enviar estado atual do vídeo para o novo usuário
    socket.emit('video-state', room.videoState);
  });
  
  // Quando um host altera o estado do vídeo (play/pause)
  socket.on('video-play-pause', ({ roomId, isPlaying, userId }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    // Somente o host pode controlar o player para todos
    const user = room.users.get(userId);
    if (user?.isHost || userId === room.hostId) {
      room.videoState.isPlaying = isPlaying;
      room.videoState.lastUpdate = Date.now();
      
      // Propagar para todos os usuários na sala, exceto o emissor
      socket.to(roomId).emit('video-play-pause-update', {
        isPlaying
      });
    }
  });
  
  // Quando um host busca em uma posição específica do vídeo
  socket.on('video-seek', ({ roomId, currentTime, userId }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    // Somente o host pode controlar o player para todos
    const user = room.users.get(userId);
    if (user?.isHost || userId === room.hostId) {
      room.videoState.currentTime = currentTime;
      room.videoState.lastUpdate = Date.now();
      
      // Propagar para todos os usuários na sala, exceto o emissor
      socket.to(roomId).emit('video-seek-update', {
        currentTime
      });
    }
  });
  
  // Quando o host atualiza o progresso do vídeo periodicamente
  socket.on('video-progress', ({ roomId, progress, userId }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    // Somente o host atualiza o progresso para manter sincronizado
    const user = room.users.get(userId);
    if (user?.isHost || userId === room.hostId) {
      room.videoState.currentTime = progress.playedSeconds;
      room.videoState.isPlaying = progress.playing;
      
      // Atualizar a cada 5 segundos para evitar excesso de mensagens
      if (Date.now() - room.videoState.lastUpdate > 5000) {
        room.videoState.lastUpdate = Date.now();
        socket.to(roomId).emit('video-progress-update', {
          currentTime: progress.playedSeconds,
          isPlaying: progress.playing
        });
      }
    }
  });
  
  // Quando um usuário sai da sala
  socket.on('leave-room', ({ roomId, userId }) => {
    handleUserDisconnect(roomId, userId);
  });
  
  // Quando um cliente se desconecta (fecha a página, etc.)
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
    
    // Encontrar o usuário em todas as salas
    for (const [roomId, room] of rooms.entries()) {
      for (const [userId, user] of room.users.entries()) {
        if (user.socketId === socket.id) {
          handleUserDisconnect(roomId, userId);
          break;
        }
      }
    }
  });
  
  // Função auxiliar para lidar com a desconexão do usuário
  function handleUserDisconnect(roomId, userId) {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    // Remover usuário da sala
    room.users.delete(userId);
    
    // Se não houver mais usuários, remover a sala
    if (room.users.size === 0) {
      rooms.delete(roomId);
      return;
    }
    
    // Se o host sair, escolher um novo host
    if (userId === room.hostId) {
      const newHost = room.users.values().next().value;
      if (newHost) {
        room.hostId = newHost.id;
        newHost.isHost = true;
        
        // Notificar novo host
        io.to(newHost.socketId).emit('host-update', {
          isHost: true
        });
      }
    }
    
    // Enviar lista de usuários atualizada para todos na sala
    const usersList = Array.from(room.users.values());
    io.to(roomId).emit('users-update', usersList);
  }
});

// Iniciar o servidor na porta definida ou 3001
const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor Socket.io rodando na porta ${PORT}`);
});

export { io, server }; 