'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  FormErrorMessage,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, loading, error, clearError } = useAuth();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email é obrigatório');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email inválido');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateEmail()) {
      return;
    }
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      // O erro já é tratado pelo hook useAuth
      console.error('Erro ao solicitar redefinição de senha:', err);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Box
        bg={bgColor}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        border="1px"
        borderColor={borderColor}
      >
        <VStack spacing={8} align="flex-start" w="full">
          <VStack spacing={1} align="center" w="full">
            <Heading as="h1" size="xl">
              Esqueci minha senha
            </Heading>
            <Text color="gray.500" textAlign="center">
              Enviaremos um link para redefinir sua senha
            </Text>
          </VStack>

          {isSubmitted ? (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Text>
                Se o email informado estiver cadastrado, você receberá um link para redefinir sua senha em breve.
              </Text>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4} w="full">
                <FormControl isInvalid={!!emailError}>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="seu@email.com"
                  />
                  {emailError && (
                    <FormErrorMessage>{emailError}</FormErrorMessage>
                  )}
                </FormControl>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  mt={4}
                  isLoading={loading}
                  loadingText="Enviando..."
                >
                  Enviar link de redefinição
                </Button>
              </VStack>
            </form>
          )}

          <HStack w="full" justify="center" pt={4}>
            <Text>Lembrou sua senha?</Text>
            <Link href="/auth/login" passHref>
              <Text as="span" color="blue.500" fontWeight="semibold">
                Voltar para o login
              </Text>
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
} 