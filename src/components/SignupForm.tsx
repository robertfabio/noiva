'use client';

import { useState } from 'react';
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
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';

export default function SignupForm({ redirectPath = '/profile' }: { redirectPath?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    displayName?: string;
    confirmPassword?: string;
  }>({});

  const { register: registerUser, error, clearError, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    let isValid = true;

    // Validar nome
    if (!displayName) {
      errors.displayName = 'Nome é obrigatório';
      isValid = false;
    }

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

    // Validar confirmação de senha
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirme sua senha';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await registerUser(email, password, displayName);
      
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo ao Noiva!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirecionamento após o cadastro bem-sucedido
      router.push(redirectPath);
    } catch {
      // Erros já são tratados pelo hook useAuth
      toast({
        title: 'Erro no cadastro',
        description: error || 'Ocorreu um erro ao criar sua conta. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGoogleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    clearError();
    try {
      await loginWithGoogle();
      // Redirecionamento será tratado pelo callback OAuth
    } catch {
      toast({
        title: 'Erro no registro com Google',
        description: error || 'Ocorreu um erro ao registrar com Google. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <Stack spacing={4}>
        <Button
          variant="outline"
          colorScheme="purple"
          leftIcon={<FaGoogle />}
          onClick={handleGoogleRegister}
          isLoading={loading}
          loadingText="Conectando..."
          size="lg"
          width="full"
        >
          Registrar com Google
        </Button>
        
        <HStack my={3}>
          <Divider />
          <Text fontSize="sm" color="gray.500" whiteSpace="nowrap" px={2}>
            ou preencha seus dados
          </Text>
          <Divider />
        </HStack>

        <FormControl id="displayName" isRequired isInvalid={!!formErrors.displayName}>
          <FormLabel htmlFor="displayName">Nome</FormLabel>
          <Input
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (formErrors.displayName) {
                setFormErrors(prev => ({...prev, displayName: undefined}));
              }
            }}
            placeholder="Seu nome"
            isDisabled={loading}
            autoComplete="name"
          />
          {formErrors.displayName && (
            <FormErrorMessage>{formErrors.displayName}</FormErrorMessage>
          )}
        </FormControl>

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
            isDisabled={loading}
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
              isDisabled={loading}
              autoComplete="new-password"
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

        <FormControl id="confirmPassword" isRequired isInvalid={!!formErrors.confirmPassword}>
          <FormLabel htmlFor="confirmPassword">Confirmar Senha</FormLabel>
          <InputGroup>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formErrors.confirmPassword) {
                  setFormErrors(prev => ({...prev, confirmPassword: undefined}));
                }
              }}
              placeholder="********"
              isDisabled={loading}
              autoComplete="new-password"
            />
            <InputRightElement>
              <IconButton
                aria-label={showConfirmPassword ? "Esconder senha" : "Mostrar senha"}
                icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                onClick={toggleConfirmPasswordVisibility}
                size="sm"
                variant="ghost"
                tabIndex={-1}
              />
            </InputRightElement>
          </InputGroup>
          {formErrors.confirmPassword && (
            <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
          )}
        </FormControl>

        {error && !formErrors.email && !formErrors.password && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}

        <Button
          type="submit"
          colorScheme="purple"
          size="lg"
          fontSize="md"
          isLoading={loading}
          loadingText="Cadastrando..."
          mt={2}
        >
          Criar Conta
        </Button>
      </Stack>
    </Box>
  );
} 