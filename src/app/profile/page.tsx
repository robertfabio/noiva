'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  SimpleGrid,
  Divider,
  Badge,
  Flex,
  useClipboard,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { FaPlus, FaSignInAlt, FaCopy, FaVideo, FaUsers, FaHistory, FaShare } from 'react-icons/fa';

interface Room {
  id: string;
  hostName: string;
  hostId: string;
  createdAt: unknown;
  lastActive: unknown;
  title?: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [hostRooms, setHostRooms] = useState<Room[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newRoomId, setNewRoomId] = useState('');
  const { hasCopied, onCopy } = useClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${newRoomId}`);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force refresh when coming back to this page
  useEffect(() => {
    const handleRouteChange = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('focus', handleRouteChange);
    
    return () => {
      window.removeEventListener('focus', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        // Fetch rooms hosted by user from backend
        const hostResponse = await fetch(`/api/rooms/hosted?userId=${user.uid}`);
        if (hostResponse.ok) {
          const hostRoomsData = await hostResponse.json();
          setHostRooms(hostRoomsData);
        }
        
        // Fetch recent rooms joined by user
        const recentResponse = await fetch(`/api/rooms/recent?userId=${user.uid}`);
        if (recentResponse.ok) {
          const recentRoomsData = await recentResponse.json();
          setRecentRooms(recentRoomsData);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Erro ao carregar as salas');
        
        // Fallback: show at least the rooms created in this session
        // This ensures we see rooms even if the API fails
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRooms();
  }, [user, refreshTrigger]);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error('Por favor, insira um código de sala válido');
      return;
    }
    
    if (!user) {
      toast.error('Você precisa estar logado para entrar em uma sala');
      return;
    }
    
    setIsJoining(true);
    
    try {
      // Join room via API
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: roomCode,
          userId: user.uid,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 404) {
          toast.error('Sala não encontrada');
          setIsJoining(false);
          return;
        }
        throw new Error(data.error || 'Error joining room');
      }
      
      // Trigger a refresh of the room list
      setRefreshTrigger(prev => prev + 1);
      
      // Navigate to the room
      router.push(`/room/${roomCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Erro ao entrar na sala');
    } finally {
      setIsJoining(false);
    }
  };

  const generateRoomId = () => {
    // Generate a random 6-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleCreateRoom = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para criar uma sala');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Generate a unique room ID
      const roomId = generateRoomId();
      
      // Add the new room to the hostRooms list immediately to show visual feedback
      const newRoom = {
        id: roomId,
        hostName: user.displayName || 'Anônimo',
        hostId: user.uid,
        createdAt: new Date(),
        lastActive: new Date()
      };
      
      setHostRooms(prev => [newRoom, ...prev]);
      
      // Try to create room via API with better error handling
      try {
        console.log('Creating room with data:', { roomId, hostId: user.uid, hostName: user.displayName || 'Anônimo' });
        
        const response = await fetch('/api/rooms/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId,
            hostId: user.uid,
            hostName: user.displayName || 'Anônimo',
          }),
        });
        
        if (!response.ok) {
          const responseData = await response.json();
          console.error('Server error response:', responseData);
          throw new Error(responseData.error || 'Failed to create room on server');
        }
        
        console.log('Room created successfully on server');
      } catch (apiError) {
        console.error('API Error:', apiError);
        // We continue with local-only room for better UX
        // The room will still work for this session but won't be saved to database
        toast('Sala criada localmente apenas. Algumas funcionalidades podem ser limitadas.', { 
          icon: '⚠️',
          duration: 5000
        });
      }
      
      // Update state and open share modal regardless of API success
      setNewRoomId(roomId);
      onOpen();
      
      // Refresh room list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Erro ao criar sala');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'Data desconhecida';
    
    // Handle different timestamp formats from Firestore
    let date: Date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      // Handle Firestore Timestamp objects
      date = timestamp.toDate();
    } else if (typeof timestamp === 'number' || typeof timestamp === 'string') {
      // Handle timestamps as numbers or ISO strings
      date = new Date(timestamp);
    } else {
      // Fallback for unknown formats
      return 'Data desconhecida';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShareRoom = () => {
    onClose();
    router.push(`/room/${newRoomId}`);
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={10}>
        <Flex justify="center" align="center" h="50vh">
          <Text>Carregando...</Text>
        </Flex>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="container.lg" py={10}>
        <Flex direction="column" justify="center" align="center" h="50vh" gap={4}>
          <Heading size="lg">Faça login para continuar</Heading>
          <Text mb={4}>Você precisa estar logado para acessar seu perfil</Text>
          <Button colorScheme="purple" as="a" href="/auth/login">
            Fazer Login
          </Button>
        </Flex>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={10}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <Flex
            justify="space-between"
            align="center"
            bg="purple.700"
            color="white"
            p={6}
            borderRadius="lg"
            boxShadow="md"
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 4, md: 0 }}
          >
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2}>
              <Heading size="lg">Olá, {user?.displayName || 'Usuário'}</Heading>
              <Text>Carregando suas salas...</Text>
            </VStack>
          </Flex>
          
          {/* Loading Indicator */}
          <Flex justify="center" py={10}>
            <Box textAlign="center">
              <Spinner size="xl" color="purple.500" mb={4} />
              <Text>Carregando suas salas...</Text>
            </Box>
          </Flex>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Welcome Section */}
        <Flex
          justify="space-between"
          align="center"
          bg="purple.700"
          color="white"
          p={6}
          borderRadius="lg"
          boxShadow="md"
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: 0 }}
        >
          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2}>
            <Heading size="lg">Olá, {user.displayName || 'Usuário'}</Heading>
            <Text>Bem-vindo(a) de volta ao Noiva</Text>
          </VStack>

          <HStack spacing={4}>
            <Button
              colorScheme="pink"
              leftIcon={<FaPlus />}
              onClick={handleCreateRoom}
              isLoading={isCreating}
            >
              Criar Sala
            </Button>
          </HStack>
        </Flex>

        {/* Join Room Section */}
        <Card variant="outline" borderRadius="lg">
          <CardBody>
            <VStack spacing={4}>
              <Heading size="md">Entrar em uma Sala</Heading>
              <HStack w="full" maxW="md">
                <InputGroup size="md">
                  <Input
                    placeholder="Código da sala"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    bg="white"
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      colorScheme="purple"
                      onClick={handleJoinRoom}
                      isLoading={isJoining}
                      leftIcon={<FaSignInAlt />}
                    >
                      Entrar
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* My Rooms Section */}
        <Box>
          <Heading size="md" mb={4}>
            Minhas Salas
          </Heading>
          
          {hostRooms.length === 0 ? (
            <Card variant="outline" p={6} borderRadius="lg" bg="gray.50">
              <VStack spacing={3} align="center">
                <Text>Você ainda não criou nenhuma sala</Text>
                <Button
                  colorScheme="purple"
                  variant="outline"
                  leftIcon={<FaPlus />}
                  onClick={handleCreateRoom}
                  isLoading={isCreating}
                >
                  Criar Sua Primeira Sala
                </Button>
              </VStack>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {hostRooms.map((room) => (
                <Card key={room.id} variant="outline" borderRadius="lg" overflow="hidden">
                  <CardHeader bg="purple.50" pb={2}>
                    <Flex justify="space-between" align="center">
                      <Heading size="sm">{room.title || `Sala ${room.id}`}</Heading>
                      <Badge colorScheme="purple">Anfitrião</Badge>
                    </Flex>
                  </CardHeader>
                  
                  <CardBody py={3}>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Box as={FaUsers} color="gray.500" />
                        <Text fontSize="sm">Anfitrião: {room.hostName}</Text>
                      </HStack>
                      <HStack>
                        <Box as={FaHistory} color="gray.500" />
                        <Text fontSize="sm">
                          Criada em: {formatDate(room.createdAt)}
                        </Text>
                      </HStack>
                      <HStack>
                        <Box as={FaVideo} color="gray.500" />
                        <Text fontSize="sm">Código: {room.id}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                  
                  <Divider />
                  
                  <CardFooter pt={2} pb={2}>
                    <HStack spacing={2} width="full" justify="space-between">
                      <Button
                        size="sm"
                        colorScheme="purple"
                        variant="solid"
                        width="full"
                        onClick={() => router.push(`/room/${room.id}`)}
                      >
                        Entrar
                      </Button>
                      <IconButton
                        aria-label="Share room"
                        icon={<FaShare />}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewRoomId(room.id);
                          onOpen();
                        }}
                      />
                    </HStack>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Recent Rooms Section */}
        {recentRooms.length > 0 && (
          <Box>
            <Heading size="md" mb={4}>
              Salas Recentes
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {recentRooms.map((room) => (
                <Card key={room.id} variant="outline" borderRadius="lg" overflow="hidden">
                  <CardHeader bg="gray.50" pb={2}>
                    <Flex justify="space-between" align="center">
                      <Heading size="sm">{room.title || `Sala ${room.id}`}</Heading>
                      <Badge>Visitada</Badge>
                    </Flex>
                  </CardHeader>
                  
                  <CardBody py={3}>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Box as={FaUsers} color="gray.500" />
                        <Text fontSize="sm">Anfitrião: {room.hostName}</Text>
                      </HStack>
                      {!!room.lastActive && (
                        <HStack>
                          <Box as={FaHistory} color="gray.500" />
                          <Text fontSize="sm">
                            Última atividade: {formatDate(room.lastActive)}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                  
                  <Divider />
                  
                  <CardFooter pt={2} pb={2}>
                    <Button
                      size="sm"
                      colorScheme="purple"
                      variant="outline"
                      width="full"
                      onClick={() => router.push(`/room/${room.id}`)}
                    >
                      Entrar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </VStack>
      
      {/* Share Room Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sala Criada com Sucesso!</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Sua sala foi criada com o código:
              </Text>
              
              <Flex
                p={3}
                bg="gray.100"
                borderRadius="md"
                justify="space-between"
                align="center"
              >
                <Heading size="md" letterSpacing="wider">
                  {newRoomId}
                </Heading>
                
                <IconButton
                  aria-label="Copy room code"
                  icon={<FaCopy />}
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(newRoomId);
                    toast.success('Código copiado!');
                  }}
                />
              </Flex>
              
              <Text fontWeight="medium">Link para compartilhar:</Text>
              
              <InputGroup>
                <Input
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/room/${newRoomId}`}
                  isReadOnly
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Copy link"
                    icon={<FaCopy />}
                    size="sm"
                    onClick={onCopy}
                  />
                </InputRightElement>
              </InputGroup>
              
              {hasCopied && (
                <Text color="green.500" fontSize="sm">
                  Link copiado para a área de transferência!
                </Text>
              )}
              
              <Text fontSize="sm" color="gray.600">
                Compartilhe este código ou link com seu parceiro para assistirem juntos.
              </Text>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button mr={3} onClick={onClose} variant="ghost">
              Fechar
            </Button>
            <Button colorScheme="purple" onClick={handleShareRoom}>
              Entrar na Sala
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
} 