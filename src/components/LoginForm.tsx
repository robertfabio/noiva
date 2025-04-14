'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export default function LoginForm({ redirectPath = '/profile' }: { redirectPath?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  const { login, error, clearError, loginWithGoogle, loading } = useAuth();

  const validateForm = async () => {
    const errors: {email?: string; password?: string} = {};
    let isValid = true;

    // Validar formato do email
    if (!email) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    // Validar senha
    if (!password) {
      errors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setIsLoading(true);
      await login(email, password);
      
      toast({
        title: 'Login realizado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirecionamento após o login bem-sucedido
      router.push(redirectPath);
    } catch {
      // Erros já são tratados pelo hook useAuth
      // Nenhuma necessidade de manipulação adicional aqui
      // O toast ainda é útil para feedback visual
      toast({
        title: 'Erro no login',
        description: error || 'Ocorreu um erro ao fazer login. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      clearError();
      await loginWithGoogle();
      // Redirecionamento será tratado pelo callback OAuth
    } catch {
      toast({
        title: 'Erro no login com Google',
        description: error || 'Ocorreu um erro ao fazer login com Google. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="400px">
      <Stack spacing={4}>
        <Button
          type="button"
          variant="outline"
          leftIcon={<FcGoogle />}
          w="full"
          onClick={handleGoogleLogin}
          isLoading={loading}
          loadingText="Processando..."
        >
          Entrar com Google
        </Button>
        
        <HStack my={3}>
          <Divider />
          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap" px={2}>
            ou acesse com email
          </Text>
          <Divider />
        </HStack>
        
        <FormControl id="email" isRequired isInvalid={!!formErrors.email}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) {
                setFormErrors(prev => ({...prev, email: undefined}));
              }
            }}
            placeholder="seu@email.com"
            isDisabled={isLoading}
            autoComplete="email"
          />
          {formErrors.email && (
            <FormErrorMessage>{formErrors.email}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl id="password" isRequired isInvalid={!!formErrors.password}>
          <FormLabel htmlFor="password">Senha</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) {
                  setFormErrors(prev => ({...prev, password: undefined}));
                }
              }}
              placeholder="********"
              isDisabled={isLoading}
              autoComplete="current-password"
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                onClick={togglePasswordVisibility}
                size="sm"
                variant="ghost"
                tabIndex={-1}
              />
            </InputRightElement>
          </InputGroup>
          {formErrors.password && (
            <FormErrorMessage>{formErrors.password}</FormErrorMessage>
          )}
        </FormControl>

        {error && !formErrors.email && !formErrors.password && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          fontSize="md"
          isLoading={isLoading}
          loadingText="Entrando..."
        >
          Entrar
        </Button>
      </Stack>
    </Box>
  );
} 