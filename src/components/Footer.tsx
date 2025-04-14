'use client';

import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VisuallyHidden,
  chakra,
  useColorModeValue,
  Button,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaInstagram, FaTwitter, FaYoutube, FaHeart } from 'react-icons/fa';

const ListHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: React.ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: 'var(--crimson-wine)',
        color: 'white',
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt={20}
      borderTop="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Text
                fontFamily="var(--font-diphylleia)"
                fontSize="2xl" 
                color="var(--crimson-wine)"
                fontWeight="bold"
              >
                Noiva
              </Text>
            </Box>
            <Text fontSize={'sm'}>
              Conectando corações à distância através de momentos compartilhados.
            </Text>
            <HStack spacing={4}>
              <SocialButton label={'Twitter'} href={'#'}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={'YouTube'} href={'#'}>
                <FaYoutube />
              </SocialButton>
              <SocialButton label={'Instagram'} href={'#'}>
                <FaInstagram />
              </SocialButton>
            </HStack>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Empresa</ListHeader>
            <Link href={'/about'}>Sobre Nós</Link>
            <Link href={'#'}>Termos de Uso</Link>
            <Link href={'#'}>Política de Privacidade</Link>
            <Link href={'#'}>Contato</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Recursos</ListHeader>
            <Link href={'/profile'}>Minhas Salas</Link>
            <Link href={'#'}>Tutoriais</Link>
            <Link href={'#'}>Perguntas Frequentes</Link>
            <Link href={'#'}>Suporte</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Conecte-se</ListHeader>
            <Button colorScheme="pink" size="sm" width="full">
              Criar Sala
            </Button>
            <Button colorScheme="purple" variant="outline" size="sm" width="full">
              Compartilhar
            </Button>
            <Text fontSize="xs" mt={4}>
              Feito com <Icon as={FaHeart} color="red.500" mx={1} /> para aproximar pessoas
            </Text>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Container
          as={Stack}
          maxW={'container.xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Text>© {new Date().getFullYear()} Noiva. Todos os direitos reservados</Text>
        </Container>
      </Box>
    </Box>
  );
} 