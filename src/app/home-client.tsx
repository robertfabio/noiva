'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Flex, Heading, Text, Box, Container, VStack, HStack, Icon, SimpleGrid, Card, CardBody, Stat, StatLabel, StatNumber, StatHelpText, StatGroup, Badge, Spinner } from '@chakra-ui/react';
import { FaPlay, FaUserFriends, FaLock, FaFilm, FaPlus, FaHistory, FaVideo, FaUsers, FaClock } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    roomsCreated: 0,
    moviesWatched: 0,
    totalHours: 0,
    connections: 0,
    loading: true
  });

  const fetchUserStats = useCallback(async () => {
    try {
      // Verificar se o usuário está logado
      if (!user || !user.uid) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      // TODO: Substituir pela consulta ao banco de dados da Vercel
      // A lógica a seguir é apenas um placeholder até implementarmos a versão Vercel
      
      // Simulando dados que viriam do Firestore
      setTimeout(() => {
        setStats({
          roomsCreated: 0,
          moviesWatched: 0,
          totalHours: 0,
          connections: 0,
          loading: false
        });
      }, 500);
      
      // Implementação antiga com Firestore:
      /*
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Salas que o usuário é anfitrião
        const hostedRooms = userData.hostedRooms || [];
        
        // Salas recentes que o usuário visitou
        const recentRooms = userData.recentRooms || [];
        
        // Contagem única de usuários com quem o usuário interagiu
        const uniqueConnections = new Set();
        
        // Obter apenas dados reais sem estimativas
        let watchedCount = 0;
        
        // Buscar detalhes das salas para obter dados precisos
        for (const roomId of [...new Set([...hostedRooms, ...recentRooms])]) {
          const roomDoc = await getDoc(doc(db, 'rooms', roomId));
          if (roomDoc.exists()) {
            const roomData = roomDoc.data();
            
            // Adicionar host como conexão se não for o próprio usuário
            if (roomData.hostId && roomData.hostId !== user.uid) {
              uniqueConnections.add(roomData.hostId);
            }
            
            // Contabilizar apenas salas com videoUrl como assistidas
            if (roomData.videoUrl) {
              watchedCount++;
            }
          }
        }
        
        setStats({
          roomsCreated: hostedRooms.length,
          moviesWatched: watchedCount,
          totalHours: userData.watchTime || 0, // Usa apenas dados reais se existirem
          connections: uniqueConnections.size,
          loading: false
        });
      } else {
        // Se o documento do usuário não existir, manter os valores zerados
        setStats({
          roomsCreated: 0,
          moviesWatched: 0,
          totalHours: 0,
          connections: 0,
          loading: false
        });
      }
      */
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    // Buscar estatísticas do usuário quando estiver logado
    if (user) {
      fetchUserStats();
    } else {
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, [user, fetchUserStats]);

  const handleCreateRoom = () => {
    router.push('/profile');
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Box bg="black.700" color="pink.300" py={16}>
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" gap={10}>
            <VStack align="flex-start" spacing={6} maxW={{ base: 'full', md: '50%' }}>
              <Heading as="h1" size="2xl" fontWeight="bold">
                {user ? `Olá, ${user.displayName || 'Usuário'}` : 'Assistam Juntos'}
                <Box as="span" color="pink.300" display="block">
                  {user ? 'Vamos assistir algo?' : 'Mesmo à Distância'}
                </Box>
              </Heading>
              
              <Text fontSize="xl">
                {user 
                  ? 'Continue assistindo a filmes e séries com seus amigos e familiares. Crie uma sala ou entre em uma existente.'
                  : 'Noiva é uma plataforma que permite que pessoas assistam a conteúdos próprios juntos em sincronia, não importa onde estejam. Compartilhe momentos especiais.'}
              </Text>
              
              <HStack spacing={4}>
                {user ? (
                  <>
                    <Button 
                      size="lg" 
                      colorScheme="pink" 
                      rightIcon={<Icon as={FaPlus} />}
                      onClick={handleCreateRoom}
                    >
                      Criar Nova Sala
                    </Button>
                    <Link href="/profile" passHref>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        colorScheme="white"
                      >
                        Minhas Salas
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signup" passHref>
                      <Button 
                        size="lg" 
                        colorScheme="pink" 
                        rightIcon={<Icon as={FaPlay} />}
                      >
                        Começar Agora
                      </Button>
                    </Link>
                    <Link href="/auth/login" passHref>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        colorScheme="white"
                      >
                        Entrar
                      </Button>
                    </Link>
                  </>
                )}
              </HStack>
            </VStack>
            
            <Box 
              width={{ base: 'full', md: '40%' }} 
              borderRadius="lg" 
              overflow="hidden"
              boxShadow="2xl"
            >
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-cover"
                poster="/images/movie-poster.jpg"
              >
                <source src="/videos/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Stats Section for logged in users */}
      {user && (
        <Box py={12} bg="purple.50">
          <Container maxW="container.xl">
            <VStack spacing={8}>
              <Heading textAlign="center" size="xl" as="h2">
                Sua Atividade
              </Heading>
              
              <StatGroup width="full" bg="white" p={6} borderRadius="lg" boxShadow="md">
                {stats.loading ? (
                  <Flex justify="center" width="full" py={8}>
                    <Spinner size="xl" color="purple.500" />
                  </Flex>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8} width="full">
                    <Stat>
                      <StatLabel>Salas Criadas</StatLabel>
                      <StatNumber>{stats.roomsCreated}</StatNumber>
                      <StatHelpText>
                        <Badge colorScheme="purple">Anfitrião</Badge>
                      </StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Vídeos Assistidos</StatLabel>
                      <StatNumber>{stats.moviesWatched}</StatNumber>
                      <StatHelpText>
                        <HStack>
                          <Icon as={FaVideo} color="green.500" />
                          <Text color="green.500">Concluídos</Text>
                        </HStack>
                      </StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Tempo Assistido</StatLabel>
                      <StatNumber>{stats.totalHours > 0 ? `${stats.totalHours}h` : '-'}</StatNumber>
                      <StatHelpText>
                        <HStack>
                          <Icon as={FaClock} color="blue.500" />
                          <Text>Registrado</Text>
                        </HStack>
                      </StatHelpText>
                    </Stat>
                    
                    <Stat>
                      <StatLabel>Pessoas Conectadas</StatLabel>
                      <StatNumber>{stats.connections}</StatNumber>
                      <StatHelpText>
                        <HStack>
                          <Icon as={FaUsers} color="pink.500" />
                          <Text>Conectadas com você</Text>
                        </HStack>
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                )}
              </StatGroup>
            </VStack>
          </Container>
        </Box>
      )}

      {/* Features Section */}
      <Box py={16} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Heading textAlign="center" size="xl" as="h2">
              Como Funciona
            </Heading>
            
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align="start"
              gap={8}
              width="full"
            >
              {/* Feature 1 */}
              <VStack 
                align="center" 
                spacing={4} 
                bg="white" 
                p={8} 
                borderRadius="lg" 
                boxShadow="md"
                flex="1"
              >
                <Icon as={FaFilm} w={10} h={10} color="var(--crimson-wine)" />
                <Heading as="h3" size="md">
                  Upload de Filmes
                </Heading>
                <Text textAlign="center">
                  Faça upload dos seus filmes favoritos e compartilhe diretamente com seu parceiro.
                </Text>
              </VStack>
              
              {/* Feature 2 */}
              <VStack 
                align="center" 
                spacing={4} 
                bg="white" 
                p={8} 
                borderRadius="lg" 
                boxShadow="md"
                flex="1"
              >
                <Icon as={FaUserFriends} w={10} h={10} color="var(--crimson-wine)" />
                <Heading as="h3" size="md">
                  Salas Privadas
                </Heading>
                <Text textAlign="center">
                  Crie salas exclusivas para vocês dois assistirem juntos, com total privacidade.
                </Text>
              </VStack>
              
              {/* Feature 3 */}
              <VStack 
                align="center" 
                spacing={4} 
                bg="white" 
                p={8} 
                borderRadius="lg" 
                boxShadow="md"
                flex="1"
              >
                <Icon as={FaLock} w={10} h={10} color="var(--crimson-wine)" />
                <Heading as="h3" size="md">
                  Sincronização Perfeita
                </Heading>
                <Text textAlign="center">
                  Os players ficam perfeitamente sincronizados - quando um pausa, o outro também pausa.
                </Text>
              </VStack>
            </Flex>
            
          </VStack>
        </Container>
      </Box>

      {/* Quick Actions for logged in users */}
      {user && (
        <Box py={16} bg="white">
          <Container maxW="container.xl">
            <VStack spacing={10}>
              <Heading textAlign="center" size="xl" as="h2">
                Ações Rápidas
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} width="full">
                <Card borderRadius="lg" boxShadow="md" _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}>
                  <CardBody p={8}>
                    <VStack spacing={4} align="center">
                      <Icon as={FaPlus} w={10} h={10} color="purple.500" />
                      <Heading size="md">Criar Nova Sala</Heading>
                      <Text textAlign="center">
                        Crie uma nova sala para assistir conteúdo com alguém especial
                      </Text>
                      <Button onClick={handleCreateRoom} colorScheme="purple" width="full">
                        Criar Sala
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card borderRadius="lg" boxShadow="md" _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}>
                  <CardBody p={8}>
                    <VStack spacing={4} align="center">
                      <Icon as={FaHistory} w={10} h={10} color="pink.500" />
                      <Heading size="md">Salas Recentes</Heading>
                      <Text textAlign="center">
                        Acesse salas que você visitou recentemente
                      </Text>
                      <Button as="a" href="/profile" colorScheme="pink" width="full">
                        Ver Salas Recentes
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card borderRadius="lg" boxShadow="md" _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}>
                  <CardBody p={8}>
                    <VStack spacing={4} align="center">
                      <Icon as={FaVideo} w={10} h={10} color="teal.500" />
                      <Heading size="md">Tutorial</Heading>
                      <Text textAlign="center">
                        Aprenda a usar todas as funcionalidades da plataforma
                      </Text>
                      <Button as="a" href="/about" colorScheme="teal" width="full">
                        Ver Tutorial
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      )}
    </main>
  );
}