'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  Spinner,
  Text,
  Heading,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';

function CallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Toda a lógica está encapsulada em um useEffect para ser executada apenas no cliente
  useEffect(() => {
    const processCallback = async () => {
      try {
        const supabase = createClient();
        
        // Verificar a sessão atual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro na autenticação:', error);
          setStatus('error');
          setErrorMessage(error.message);
          return;
        }
        
        if (data.session) {
          console.log('Autenticação bem-sucedida:', data.session.user.id);
          setStatus('success');
          
          // Redirecionamento com timeout para garantir que os estados sejam atualizados
          setTimeout(() => {
            router.push('/profile');
          }, 1500);
        } else {
          console.warn('Nenhuma sessão encontrada após autenticação');
          setStatus('error');
          setErrorMessage('Falha na autenticação. Tente novamente.');
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setStatus('error');
        setErrorMessage('Ocorreu um erro inesperado durante a autenticação.');
      }
    };
    
    processCallback();
  }, [router]);
  
  if (status === 'loading') {
    return (
      <>
        <Heading size="lg">Processando seu login</Heading>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
        <Text align="center">
          Aguarde enquanto concluímos sua autenticação...
        </Text>
      </>
    );
  }
  
  if (status === 'success') {
    return (
      <>
        <Heading size="lg" color="green.500">Login realizado com sucesso!</Heading>
        <Text align="center">
          Você será redirecionado automaticamente...
        </Text>
      </>
    );
  }
  
  return (
    <>
      <Heading size="lg" color="red.500">Erro na autenticação</Heading>
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {errorMessage || 'Ocorreu um erro durante o login.'}
      </Alert>
      <Button 
        colorScheme="purple" 
        onClick={() => router.push('/auth/login')}
      >
        Voltar para a página de login
      </Button>
    </>
  );
}

export default function ClientCallback() {
  return (
    <Suspense fallback={
      <>
        <Heading size="lg">Carregando...</Heading>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
      </>
    }>
      <CallbackContent />
    </Suspense>
  );
} 