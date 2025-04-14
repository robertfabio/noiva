import { Server } from 'socket.io';
import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// Define types for room users
interface RoomUser {
  id: string;
  name: string;
  photoURL?: string | null;
  isHost: boolean;
  socketId: string;
}

// Map to store room users
const roomUsers = new Map<string, RoomUser[]>();

// Add Socket.io to global type
declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined;
}

export async function GET() {
  // Create Socket.io server if it doesn't exist already on the global object
  if (!global.io) {
    console.log('Initializing Socket.io server...');
    const io = new Server({
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    
    global.io = io;
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      // Join a room
      socket.on('join-room', async (data) => {
        const { roomId, userId, userName, photoURL, isHost } = data;
        
        // Add user to room
        socket.join(roomId);
        
        // Initialize room users array if doesn't exist
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, []);
        }
        
        // Add user to room users (or update if already exists)
        const roomUserList = roomUsers.get(roomId) || [];
        const existingUserIndex = roomUserList.findIndex(u => u.id === userId);
        
        const userInfo: RoomUser = {
          id: userId,
          name: userName,
          photoURL,
          isHost,
          socketId: socket.id,
        };
        
        if (existingUserIndex >= 0) {
          roomUserList[existingUserIndex] = userInfo;
        } else {
          roomUserList.push(userInfo);
        }
        
        roomUsers.set(roomId, roomUserList);
        
        // Update user list for all users in the room
        io.to(roomId).emit('users-update', roomUserList);
        
        // Update video state for new user
        try {
          // Fetch current video state from the database
          const supabase = createServiceClient();
          const { data } = await supabase
            .from('rooms')
            .select('videoUrl, videoTitle')
            .eq('id', roomId)
            .single();
            
          if (data && data.videoUrl) {
            // Send video info only to the joining user
            socket.emit('video-info', {
              videoUrl: data.videoUrl,
              videoTitle: data.videoTitle,
            });
          }
        } catch (error) {
          console.error('Error fetching room video state:', error);
        }
      });
      
      // Leave a room
      socket.on('leave-room', (data) => {
        const { roomId, userId } = data;
        
        // Remove user from room
        socket.leave(roomId);
        
        // Remove user from room users
        if (roomUsers.has(roomId)) {
          const roomUserList = roomUsers.get(roomId) || [];
          const updatedUserList = roomUserList.filter(u => u.id !== userId);
          
          if (updatedUserList.length === 0) {
            // If no users left, remove room
            roomUsers.delete(roomId);
          } else {
            roomUsers.set(roomId, updatedUserList);
            
            // If host left, assign host to the next user
            if (!updatedUserList.some(u => u.isHost)) {
              updatedUserList[0].isHost = true;
              
              // Notify new host
              io.to(updatedUserList[0].socketId).emit('host-update', {
                isHost: true,
              });
            }
            
            // Update user list for all users in the room
            io.to(roomId).emit('users-update', updatedUserList);
          }
        }
      });
      
      // Handle video actions (play, pause, seek)
      socket.on('video-action', (data) => {
        const { roomId, action, value } = data;
        
        // Broadcast action to all users in the room except sender
        socket.broadcast.to(roomId).emit('video-action', {
          type: action,
          value,
        });
      });
      
      // Handle chat messages
      socket.on('chat-message', (data) => {
        const { roomId, userId, userName, photoURL, text } = data;
        
        // Broadcast message to all users in the room
        io.to(roomId).emit('chat-message', {
          id: `${Date.now()}-${userId}`,
          user: {
            id: userId,
            name: userName,
            photoURL,
          },
          text,
          timestamp: Date.now(),
        });
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Find and remove user from all rooms
        roomUsers.forEach((users, roomId) => {
          const userIndex = users.findIndex(u => u.socketId === socket.id);
          
          if (userIndex >= 0) {
            const wasHost = users[userIndex].isHost;
            users.splice(userIndex, 1);
            
            if (users.length === 0) {
              // If no users left, remove room
              roomUsers.delete(roomId);
            } else {
              // If host left, assign host to the next user
              if (wasHost) {
                users[0].isHost = true;
                
                // Notify new host
                io.to(users[0].socketId).emit('host-update', {
                  isHost: true,
                });
              }
              
              // Update user list for all users in the room
              io.to(roomId).emit('users-update', users);
            }
          }
        });
      });
    });
    
    io.listen(3001);
  }
  
  return new Response('Socket.io server running');
} 