// Este é um componente de servidor (Server Component)
import { Suspense } from 'react';
import { 
  Container, 
  Spinner, 
  VStack, 
  Heading, 
  Text 
} from '@chakra-ui/react';
import ClientCallback from './client';

// Configurações para garantir que esta página não seja pré-renderizada
export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export const revalidate = 0;

export default function AuthCallbackPage() {
  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="center">
        <Suspense fallback={
          <>
            <Heading size="lg">Processando seu login</Heading>
            <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
            <Text align="center">
              Aguarde enquanto concluímos sua autenticação...
            </Text>
          </>
        }>
          <ClientCallback />
        </Suspense>
      </VStack>
    </Container>
  );
} 