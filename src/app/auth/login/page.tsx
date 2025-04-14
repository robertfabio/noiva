'use client';

import React from 'react';
import Link from 'next/link';
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Divider,
  Card,
  CardBody,
} from '@chakra-ui/react';
import LoginForm from '@/components/LoginForm';

// Metadata não pode ser exportado de um componente 'use client'
// Será definido em um arquivo metadata.ts separado

export default function Login() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="md" py={{ base: 8, md: 12 }}>
      <Card 
        bg={bgColor}
        p={8} 
        borderRadius="lg" 
        boxShadow="lg" 
        border="1px"
        borderColor={borderColor}
        w="100%"
      >
        <CardBody p={0}>
          <VStack spacing={8} align="flex-start" w="full">
            <VStack spacing={1} align="center" w="full">
              <Heading as="h1" size="xl">
                Entrar
              </Heading>
              <Text color="gray.500">
                Acesse sua conta para continuar
              </Text>
            </VStack>

            <LoginForm redirectPath="/" />
            
            <Divider />
            
            <VStack spacing={1} align="center" w="full">
              <HStack spacing={1}>
                <Text>Não tem uma conta?</Text>
                <Link href="/auth/signup" passHref>
                  <Text as="span" color="purple.500" fontWeight="semibold">
                    Registre-se
                  </Text>
                </Link>
              </HStack>
              <Link href="/auth/forgot-password" passHref>
                <Text as="span" color="purple.500" fontSize="sm">
                  Esqueci minha senha
                </Text>
              </Link>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
} 