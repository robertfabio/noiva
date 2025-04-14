'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  
  const { updatePassword, loading, error, clearError, user } = useAuth();
  const router = useRouter();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Verificar se o link é válido e se o usuário está autenticado para redefinir senha
  useEffect(() => {
    // Se houver um erro com o link de redefinição, o Supabase Auth já vai detectar
    const checkSession = async () => {
      if (!user && !loading) {
        // Se não tiver usuário ou sessão válida após carregar
        const url = new URL(window.location.href);
        if (!url.hash || !url.hash.includes('type=recovery')) {
          setIsValidLink(false);
        }
      }
    };
    
    checkSession();
  }, [user, loading]);

  const validateForm = () => {
    let isValid = true;
    
    // Validar senha
    if (!password) {
      setPasswordError('Nova senha é obrigatória');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Validar confirmação de senha
    if (!confirmPassword) {
      setConfirmPasswordError('Confirme sua nova senha');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await updatePassword(password);
      setIsSubmitted(true);
      
      // Redirecionar para a página de login após alguns segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      // O erro já é tratado pelo hook useAuth
      console.error('Erro ao atualizar senha:', err);
    }
  };

  // Se o link não for válido
  if (!isValidLink && !loading) {
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
          <VStack spacing={6}>
            <Heading as="h1" size="xl">Link Inválido</Heading>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text>
                Este link de redefinição de senha é inválido ou expirou.
              </Text>
            </Alert>
            <Link href="/auth/forgot-password" passHref>
              <Button as="span" colorScheme="blue">
                Solicitar novo link
              </Button>
            </Link>
          </VStack>
        </Box>
      </Container>
    );
  }

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
              Criar nova senha
            </Heading>
            <Text color="gray.500" textAlign="center">
              Digite e confirme sua nova senha
            </Text>
          </VStack>

          {isSubmitted ? (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Text>
                Senha atualizada com sucesso! Você será redirecionado para a página de login em alguns segundos.
              </Text>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4} w="full">
                <FormControl isInvalid={!!passwordError}>
                  <FormLabel htmlFor="password">Nova senha</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="********"
                  />
                  {passwordError && (
                    <FormErrorMessage>{passwordError}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!confirmPasswordError}>
                  <FormLabel htmlFor="confirmPassword">Confirmar senha</FormLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    placeholder="********"
                  />
                  {confirmPasswordError && (
                    <FormErrorMessage>{confirmPasswordError}</FormErrorMessage>
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
                  loadingText="Atualizando..."
                >
                  Atualizar senha
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