'use client';

import React, { useState } from 'react';
import {
  SimpleGrid,
  Box,
  Image,
  Heading,
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  Flex,
  Tooltip,
  useColorModeValue,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FaPlay, FaClock, FaSearch } from 'react-icons/fa';
import { catalogMovies, CatalogMovie } from '@/lib/catalog';

interface MovieCatalogProps {
  onSelectMovie: (movie: CatalogMovie) => void;
  isHost: boolean;
}

const MovieCatalog: React.FC<MovieCatalogProps> = ({
  onSelectMovie,
  isHost,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Filtra os filmes com base no termo de busca
  const filteredMovies = catalogMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formata a duração do filme em horas e minutos
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Heading size="md" mb={2}>
        Catálogo de Filmes
      </Heading>
      
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FaSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Buscar filmes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          borderRadius="md"
        />
      </InputGroup>
      
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
        {filteredMovies.map((movie) => (
          <Box
            key={movie.id}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            bg={cardBg}
            transition="transform 0.2s"
            _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
          >
            <Box position="relative" height="200px">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                objectFit="cover"
                w="100%"
                h="100%"
              />
              <Badge
                position="absolute"
                top="2"
                right="2"
                colorScheme="purple"
                borderRadius="full"
                px={2}
              >
                {movie.year}
              </Badge>
            </Box>
            
            <Box p={4}>
              <Heading size="sm" mb={2} noOfLines={1}>
                {movie.title}
              </Heading>
              
              <Text fontSize="sm" color="gray.600" noOfLines={3} mb={3}>
                {movie.description}
              </Text>
              
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <Badge colorScheme="teal">{movie.genre}</Badge>
                  <Tooltip label={`Duração: ${formatDuration(movie.duration)}`}>
                    <Flex align="center">
                      <Icon as={FaClock} color="gray.500" mr={1} />
                      <Text fontSize="xs" color="gray.500">
                        {formatDuration(movie.duration)}
                      </Text>
                    </Flex>
                  </Tooltip>
                </HStack>
                
                {isHost && (
                  <Button
                    size="sm"
                    colorScheme="purple"
                    leftIcon={<Icon as={FaPlay} />}
                    onClick={() => onSelectMovie(movie)}
                  >
                    Assistir
                  </Button>
                )}
              </Flex>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
      
      {filteredMovies.length === 0 && (
        <Text textAlign="center" py={4}>
          Nenhum filme encontrado para &quot;{searchTerm}&quot;
        </Text>
      )}
      
      {!isHost && (
        <Text textAlign="center" color="gray.500" mt={4}>
          Apenas o anfitrião pode selecionar filmes
        </Text>
      )}
    </VStack>
  );
};

export default MovieCatalog; 