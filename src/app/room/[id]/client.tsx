'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Button,
  useDisclosure,
  Text,
  Flex,
  ButtonGroup,
  Icon,
  Avatar,
  AvatarGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from '@chakra-ui/react';
import { FaUsers, FaUpload, FaFilm, FaComment, FaPlus } from 'react-icons/fa';
import VideoPlayer from '@/components/VideoPlayer';
import ChatBox from '@/components/ChatBox';
import UploadModal from '@/components/UploadModal';
import MovieCatalog from '@/components/MovieCatalog';
import { CatalogMovie } from '@/lib/catalog';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    photoURL?: string;
  };
  timestamp: number;
}

interface RoomUser {
  id: string;
  name: string;
  photoURL?: string;
  isHost: boolean;
  socketId: string;
}

interface RemoteAction {
  type: 'play' | 'pause' | 'seek';
  value?: number;
}

export default function RoomClient() {
  const params = useParams() as { id: string };
  const roomId = params.id;
  const { user, loading: authLoading } = useAuth();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [messages] = useState<Message[]>([]);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [isHost, setIsHost] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roomCreated, setRoomCreated] = useState(false);
  const [remoteAction, setRemoteAction] = useState<RemoteAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Connect to socket.io server
  useEffect(() => {
    if (!user || !roomId) return;
    
    // Inicializar lista de usuários apenas com o usuário atual
    setRoomUsers([
      {
        id: user.uid,
        name: user.displayName || 'Anônimo',
        photoURL: user.photoURL || '',
        isHost: isHost,
        socketId: 'local'
      }
    ]);
    
    // Importar socket.io-client dinamicamente
    import('socket.io-client').then(({ io }) => {
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin
        : 'http://localhost:3000';
      
      const socket = io(socketUrl, {
        path: '/api/socket',
      });
      
      socket.on('connect', () => {
        console.log('Conectado ao servidor Socket.io:', socket.id);
        
        // Entrar na sala
        socket.emit('join-room', {
          roomId,
          userId: user.uid,
          userName: user.displayName || 'Anônimo',
          photoURL: user.photoURL,
          isHost
        });
      });
      
      // Atualizar lista de usuários na sala
      socket.on('users-update', (users) => {
        setRoomUsers(users);
      });
      
      // Receber atualização de host (se o host original sair)
      socket.on('host-update', (data) => {
        setIsHost(data.isHost);
        toast.success('Você agora é o anfitrião da sala');
      });
      
      // Receber ações de vídeo (play, pause, seek)
      socket.on('video-action', (action) => {
        if (action.type === 'play' || action.type === 'pause' || action.type === 'seek') {
          setRemoteAction(action);
        }
      });
      
      return () => {
        // Sair da sala ao desconectar
        socket.emit('leave-room', {
          roomId,
          userId: user.uid
        });
        
        socket.disconnect();
      };
    });
  }, [roomId, user, isHost]);

  // Update the checkIfHost function to record room visits
  useEffect(() => {
    if (!user || !roomId) return;
    
    const checkIfHost = async () => {
      try {
        setIsLoading(true);
        
        // Check if room exists and record visit via API
        const response = await fetch('/api/rooms/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId,
            userId: user.uid,
          }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          if (response.status === 404) {
            toast.error('Sala não encontrada');
            router.push('/profile');
            return;
          }
          throw new Error(data.error || 'Error joining room');
        }
        
        const { room } = await response.json();
        
        // Set room data from the response
        setIsHost(room.hostId === user.uid);
        setVideoUrl(room.videoUrl || '');
        setVideoTitle(room.videoTitle || '');
        setRoomCreated(true);
      } catch (error) {
        console.error('Error checking room:', error);
        toast.error('Erro ao acessar sala');
        router.push('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    checkIfHost();
  }, [roomId, user, router]);

  // Listen for room changes (video url)
  useEffect(() => {
    if (!roomId) return;

    // TODO: Implementar listener com websockets ou polling
    // A implementação anterior com Firestore:
    /*
    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId as string), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setVideoUrl(data.videoUrl || '');
        setVideoTitle(data.videoTitle || '');
      }
    });

    return () => unsubscribe();
    */
    
    // Implementação temporária: não faz nada
    return () => {};
  }, [roomId]);

  // Listen for messages
  useEffect(() => {
    if (!roomId) return;

    // TODO: Implementar listener de mensagens com websockets
    // A implementação anterior com Firestore:
    /*
    const q = query(
      collection(db, 'rooms', roomId as string, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
    */
    
    // Implementação temporária: não faz nada
    return () => {};
  }, [roomId]);

  // Handle play/pause actions from remote
  const handlePlayPause = useCallback(
    (isPlaying: boolean) => {
      if (!isHost) return; // Só enviar se for o host
      
      // Importar socket.io-client dinamicamente
      import('socket.io-client').then(({ io }) => {
        const socketUrl = process.env.NODE_ENV === 'production' 
          ? window.location.origin
          : 'http://localhost:3000';
        
        const socketConnection = io(socketUrl, {
          path: '/api/socket',
        });
        
        // Enviar ação para todos os usuários na sala
        socketConnection.emit('video-action', {
          roomId,
          action: isPlaying ? 'play' : 'pause'
        });
      });
    },
    [roomId, isHost]
  );

  // Handle seek actions from remote
  const handleSeek = useCallback(
    (seconds: number) => {
      if (!isHost) return; // Só enviar se for o host
      
      // Importar socket.io-client dinamicamente
      import('socket.io-client').then(({ io }) => {
        const socketUrl = process.env.NODE_ENV === 'production' 
          ? window.location.origin
          : 'http://localhost:3000';
        
        const socketConnection = io(socketUrl, {
          path: '/api/socket',
        });
        
        // Enviar ação para todos os usuários na sala
        socketConnection.emit('video-action', {
          roomId,
          action: 'seek',
          value: seconds
        });
      });
    },
    [roomId, isHost]
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!user || !roomId) return;

      try {
        // TODO: Implementar usando API da Vercel
        console.log('Enviando mensagem:', text);
        
        // Implementação anterior com Firebase:
        /*
        // Add message to Firestore
        await addDoc(collection(db, 'rooms', roomId as string, 'messages'), {
          text,
          user: {
            id: user.uid,
            name: user.displayName || 'Anônimo',
            photoURL: user.photoURL,
          },
          timestamp: Date.now(),
        });
        */

        // Simular envio de mensagem para o chat
        import('socket.io-client').then(({ io }) => {
          const socketUrl = process.env.NODE_ENV === 'production' 
            ? window.location.origin
            : 'http://localhost:3000';
          
          const socketConnection = io(socketUrl, {
            path: '/api/socket',
          });
          
          socketConnection.emit('chat-message', {
            roomId,
            userId: user.uid,
            userName: user.displayName || 'Anônimo',
            photoURL: user.photoURL,
            text
          });
        });
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Erro ao enviar mensagem');
      }
    },
    [roomId, user]
  );

  const handleVideoUpload = async (url: string, title: string) => {
    if (!user || !isHost) return;
    
    try {
      setIsLoading(true);
      
      // Update video info via API
      const response = await fetch('/api/rooms/update-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          videoUrl: url,
          videoTitle: title,
          userId: user.uid,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error updating video');
      }
      
      // Update local state
      setVideoUrl(url);
      setVideoTitle(title);
      
      // Notify other users via socket.io
      import('socket.io-client').then(({ io }) => {
        const socketUrl = process.env.NODE_ENV === 'production' 
          ? window.location.origin
          : 'http://localhost:3000';
        
        const socketConnection = io(socketUrl, {
          path: '/api/socket',
        });
        
        socketConnection.emit('chat-message', {
          roomId,
          userId: user.uid,
          userName: user.displayName || 'Anônimo',
          photoURL: user.photoURL,
          text: `adicionou o vídeo: ${title}`
        });
      });
      
      toast.success('Vídeo adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      toast.error('Erro ao adicionar vídeo');
    } finally {
      setIsLoading(false);
      onClose();
    }
  };
  
  const handleSelectMovie = async (movie: CatalogMovie) => {
    if (!isHost || !user) return;
    
    try {
      setIsLoading(true);
      
      // Update video info via API
      const response = await fetch('/api/rooms/update-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          videoUrl: movie.videoUrl,
          videoTitle: movie.title,
          userId: user.uid,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error updating video');
      }
      
      // Update local state
      setVideoUrl(movie.videoUrl);
      setVideoTitle(movie.title);
      
      // Notify other users via socket.io
      import('socket.io-client').then(({ io }) => {
        const socketUrl = process.env.NODE_ENV === 'production' 
          ? window.location.origin
          : 'http://localhost:3000';
        
        const socketConnection = io(socketUrl, {
          path: '/api/socket',
        });
        
        socketConnection.emit('chat-message', {
          roomId,
          userId: user.uid,
          userName: user.displayName || 'Anônimo',
          photoURL: user.photoURL,
          text: `selecionou o filme: ${movie.title}`
        });
      });
      
      toast.success(`Filme "${movie.title}" selecionado com sucesso!`);
    } catch (error) {
      console.error('Erro ao selecionar filme:', error);
      toast.error('Erro ao selecionar filme');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!roomId || !roomCreated) return;
    
    // Buscar detalhes da sala a cada 30 segundos
    const fetchRoom = async () => {
      // TODO: Implementar utilizando serviços da Vercel
      // Esta é apenas uma função vazia por enquanto
    };
    
    // Fetch da sala a cada 30 segundos para manter dados atualizados
    const fetchRoomInterval = setInterval(fetchRoom, 30000);
    
    return () => {
      clearInterval(fetchRoomInterval);
    };
  }, [roomId, user, authLoading, router, roomCreated]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="70vh">
        <Text>Carregando...</Text>
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex direction="column" justify="center" align="center" minH="70vh" gap={4}>
        <Text fontSize="xl">Você precisa estar logado para acessar esta sala</Text>
        <Button colorScheme="purple" as="a" href="/auth/login">
          Fazer Login
        </Button>
      </Flex>
    );
  }

  if (!roomCreated) {
    return (
      <Flex justify="center" align="center" minH="70vh">
        <Text>Criando sala...</Text>
      </Flex>
    );
  }

  return (
    <Box p={4} maxW="container.xl" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" display="flex" alignItems="center">
          Sala: {roomId} 
          {videoTitle && (
            <Text as="span" fontSize="md" ml={2} color="gray.500">
              • {videoTitle}
            </Text>
          )}
        </Heading>
        <Flex align="center" gap={4}>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button leftIcon={<Icon as={FaUsers} />}>
              {roomUsers.length} Usuários
            </Button>
          </ButtonGroup>
          
          {isHost && (
            <Button
              colorScheme="purple"
              size="sm"
              leftIcon={<Icon as={FaPlus} />}
              onClick={onOpen}
              mt={2}
            >
              Adicionar Vídeo
            </Button>
          )}
          
          <AvatarGroup size="sm" max={3}>
            {roomUsers.map((roomUser) => (
              <Avatar
                key={roomUser.id}
                name={roomUser.name}
                src={roomUser.photoURL}
              />
            ))}
          </AvatarGroup>
        </Flex>
      </Flex>

      <Grid
        templateColumns={{ base: '1fr', lg: '3fr 1fr' }}
        gap={6}
        minH="70vh"
      >
        <GridItem>
          {videoUrl ? (
            <Box h="full" minH="70vh">
              <VideoPlayer
                url={videoUrl}
                roomId={roomId as string}
                isHost={isHost}
                onPlayPause={handlePlayPause}
                onSeek={handleSeek}
                remoteAction={remoteAction}
              />
            </Box>
          ) : (
            <Tabs variant="soft-rounded" colorScheme="purple">
              <TabList>
                <Tab><Icon as={FaUpload} mr={2} /> Upload</Tab>
                <Tab><Icon as={FaFilm} mr={2} /> Catálogo</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Flex
                    direction="column"
                    justify="center"
                    align="center"
                    h="full"
                    minH="60vh"
                    bg="gray.100"
                    borderRadius="lg"
                    gap={4}
                  >
                    <Text fontSize="xl">Nenhum vídeo carregado</Text>
                    {isHost ? (
                      <Button
                        colorScheme="purple"
                        leftIcon={<Icon as={FaUpload} />}
                        onClick={onOpen}
                      >
                        Carregar Vídeo
                      </Button>
                    ) : (
                      <Text color="gray.500">
                        Apenas o anfitrião pode carregar vídeos
                      </Text>
                    )}
                  </Flex>
                </TabPanel>
                <TabPanel>
                  <Box bg="gray.100" borderRadius="lg" p={6} minH="60vh">
                    <MovieCatalog onSelectMovie={handleSelectMovie} isHost={isHost} />
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </GridItem>

        <GridItem>
          <Tabs variant="soft-rounded" colorScheme="purple" size="sm">
            <TabList>
              <Tab><Icon as={FaComment} mr={2} /> Chat</Tab>
              <Tab><Icon as={FaUsers} mr={2} /> Usuários</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0} pt={4}>
                <Box h="full" minH="70vh">
                  <ChatBox
                    roomId={roomId as string}
                    currentUser={user}
                    onSendMessage={handleSendMessage}
                    messages={messages}
                  />
                </Box>
              </TabPanel>
              <TabPanel>
                <Box h="full" minH="70vh">
                  <Heading size="sm" mb={4}>Usuários na Sala</Heading>
                  <Flex direction="column" gap={2}>
                    {roomUsers.map((roomUser) => (
                      <Flex key={roomUser.id} align="center" gap={2} p={2} borderRadius="md" bg="gray.100">
                        <Avatar size="sm" name={roomUser.name} src={roomUser.photoURL} />
                        <Text>{roomUser.name}</Text>
                        {roomUser.isHost && (
                          <Badge colorScheme="purple" ml="auto">
                            Anfitrião
                          </Badge>
                        )}
                      </Flex>
                    ))}
                  </Flex>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
      </Grid>

      <UploadModal
        isOpen={isOpen}
        onClose={onClose}
        onVideoUploaded={handleVideoUpload}
      />
    </Box>
  );
} 