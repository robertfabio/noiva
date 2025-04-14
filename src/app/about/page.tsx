'use client';

import { Container, VStack, Heading, Text, Box, SimpleGrid, HStack, Divider, List, ListItem, ListIcon, Icon } from '@chakra-ui/react';
import { FaUsers, FaFilm, FaPlay, FaComment, FaCheckCircle, FaLock } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={10} align="start">
        {/* Hero Section */}
        <Box textAlign="center" w="full">
          <Heading as="h1" size="2xl" mb={4}>
            Como o Noiva Funciona
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Assista filmes a distância, mas juntos. Criado especialmente para casais.
          </Text>
        </Box>

        <Divider />

        {/* Overview Section */}
        <VStack align="start" spacing={4} w="full">
          <Heading as="h2" size="xl">
            Visão Geral
          </Heading>
          <Text fontSize="lg">
            O Noiva permite que você e seu parceiro(a) assistam ao mesmo filme 
            simultaneamente, mesmo estando a quilômetros de distância. A plataforma 
            sincroniza automaticamente o player de vídeo, garantindo que vocês 
            estejam assistindo exatamente à mesma cena, ao mesmo tempo.
          </Text>
        </VStack>

        {/* Features Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
          {/* Feature 1 */}
          <Box p={6} borderRadius="lg" borderWidth="1px">
            <HStack mb={4}>
              <Icon as={FaUsers} color="purple.500" boxSize={6} />
              <Heading as="h3" size="md">
                Salas Privadas
              </Heading>
            </HStack>
            <Text>
              Crie salas exclusivas com códigos de acesso únicos. Apenas as pessoas 
              com quem você compartilhar o código podem entrar na sala.
            </Text>
          </Box>

          {/* Feature 2 */}
          <Box p={6} borderRadius="lg" borderWidth="1px">
            <HStack mb={4}>
              <Icon as={FaFilm} color="purple.500" boxSize={6} />
              <Heading as="h3" size="md">
                Upload de Vídeos
              </Heading>
            </HStack>
            <Text>
              Faça upload dos seus filmes favoritos para assistir juntos. 
              Suportamos diversos formatos de vídeo e também links externos.
            </Text>
          </Box>

          {/* Feature 3 */}
          <Box p={6} borderRadius="lg" borderWidth="1px">
            <HStack mb={4}>
              <Icon as={FaPlay} color="purple.500" boxSize={6} />
              <Heading as="h3" size="md">
                Sincronização Perfeita
              </Heading>
            </HStack>
            <Text>
              Quando um participante dá play, pause ou avança, a mesma ação acontece 
              para todos na sala. É como estar no mesmo sofá!
            </Text>
          </Box>

          {/* Feature 4 */}
          <Box p={6} borderRadius="lg" borderWidth="1px">
            <HStack mb={4}>
              <Icon as={FaComment} color="purple.500" boxSize={6} />
              <Heading as="h3" size="md">
                Chat em Tempo Real
              </Heading>
            </HStack>
            <Text>
              Converse durante o filme através do chat integrado, compartilhe suas 
              reações e impressões em tempo real.
            </Text>
          </Box>
        </SimpleGrid>

        <Divider />

        {/* How to Use Section */}
        <VStack align="start" spacing={6} w="full">
          <Heading as="h2" size="xl">
            Como Usar
          </Heading>

          <List spacing={4} w="full">
            <ListItem>
              <HStack align="start">
                <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                <Box>
                  <Text fontWeight="bold">Crie uma conta</Text>
                  <Text color="gray.600">
                    Registre-se gratuitamente na plataforma para começar a usar.
                  </Text>
                </Box>
              </HStack>
            </ListItem>

            <ListItem>
              <HStack align="start">
                <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                <Box>
                  <Text fontWeight="bold">Crie uma sala</Text>
                  <Text color="gray.600">
                    No seu perfil, clique em &quot;Criar Sala&quot; para gerar um código único.
                  </Text>
                </Box>
              </HStack>
            </ListItem>

            <ListItem>
              <HStack align="start">
                <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                <Box>
                  <Text fontWeight="bold">Compartilhe o código</Text>
                  <Text color="gray.600">
                    Envie o código da sala para seu parceiro(a) por mensagem, e-mail ou qualquer outro meio.
                  </Text>
                </Box>
              </HStack>
            </ListItem>

            <ListItem>
              <HStack align="start">
                <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                <Box>
                  <Text fontWeight="bold">Faça upload ou adicione um link</Text>
                  <Text color="gray.600">
                    Carregue um arquivo de vídeo ou adicione um link para o vídeo que desejam assistir.
                  </Text>
                </Box>
              </HStack>
            </ListItem>

            <ListItem>
              <HStack align="start">
                <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                <Box>
                  <Text fontWeight="bold">Começar a assistir</Text>
                  <Text color="gray.600">
                    Aguarde seu parceiro(a) entrar na sala e comece a assistir juntos!
                  </Text>
                </Box>
              </HStack>
            </ListItem>
          </List>
        </VStack>

        <Divider />

        {/* Privacy and Security Section */}
        <VStack align="start" spacing={4} w="full">
          <Heading as="h2" size="xl">
            Privacidade e Segurança
          </Heading>
          <HStack align="start" spacing={4}>
            <Icon as={FaLock} color="purple.500" boxSize={6} mt={1} />
            <Text>
              No Noiva, valorizamos sua privacidade. Seus vídeos são armazenados 
              com segurança e acessíveis apenas pelos participantes da sala. Todo o 
              tráfego é criptografado e as salas são completamente privadas.
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Container>
  );
}