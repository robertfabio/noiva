'use client';

import React, { useState, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
  VStack,
  Box,
  Progress,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  InputGroup,
  InputRightElement,
  Icon
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/hooks/useAuth';
import { FaUpload, FaLink, FaPaste } from 'react-icons/fa';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUploaded: (url: string, title: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onVideoUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [videoLink, setVideoLink] = useState('');
  const toast = useToast();
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const videoFile = acceptedFiles[0];
    
    if (videoFile && videoFile.type.startsWith('video/')) {
      setFile(videoFile);
      // Usar o nome do arquivo como título padrão, sem a extensão
      setTitle(videoFile.name.split('.').slice(0, -1).join('.'));
    } else {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Por favor, faça upload apenas de arquivos de vídeo.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': []
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file || !user) return;
    
    try {
      setUploading(true);
      
      // Criar FormData para o upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Obter token de autenticação do localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Upload para o Vercel Blob via nossa API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Falha ao fazer upload do vídeo');
      }
      
      const data = await response.json();
      
      // Chamar a função de callback com a URL do vídeo e o título
      onVideoUploaded(data.url, title || data.filename);
      
      // Fechar o modal
      onClose();
      
      toast({
        title: 'Upload concluído',
        description: 'Seu vídeo foi carregado com sucesso!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      toast({
        title: 'Erro no upload',
        description: 'Houve um problema ao carregar seu vídeo. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  const handleAddLink = () => {
    if (!videoLink || !user) return;
    
    try {
      // Validar se o link parece ser um URL válido
      new URL(videoLink);
      
      // Chamar a função de callback com o link de vídeo e o título
      onVideoUploaded(videoLink, title || 'Vídeo Externo');
      
      // Fechar o modal
      onClose();
      
      toast({
        title: 'Link adicionado',
        description: 'O link do vídeo foi adicionado com sucesso!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Link inválido',
        description: 'Por favor, insira um URL válido para o vídeo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setVideoLink(text);
      }
    } catch {
      toast({
        title: 'Erro ao colar',
        description: 'Não foi possível acessar a área de transferência.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adicionar Vídeo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs isFitted variant="enclosed" index={tabIndex} onChange={setTabIndex}>
            <TabList mb="1em">
              <Tab><Icon as={FaLink} mr={2} /> Link Externo</Tab>
              <Tab><Icon as={FaUpload} mr={2} /> Upload</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Link do Vídeo</FormLabel>
                    <InputGroup>
                      <Input
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        placeholder="https://exemplo.com/video.m3u8"
                      />
                      <InputRightElement>
                        <Button size="sm" onClick={handlePasteFromClipboard}>
                          <Icon as={FaPaste} />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <Text fontSize="xs" mt={1} color="gray.500">
                      Suporta links diretos, streaming HLS (.m3u8), DASH (.mpd) e outros formatos
                    </Text>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Título do Vídeo</FormLabel>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Digite o título do vídeo"
                    />
                  </FormControl>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={4}>
                  <Box
                    {...getRootProps()}
                    w="100%"
                    h="200px"
                    border="2px dashed"
                    borderColor={isDragActive ? "purple.500" : "gray.300"}
                    borderRadius="md"
                    p={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    cursor="pointer"
                    bg={isDragActive ? "purple.50" : "transparent"}
                    _hover={{ bg: "purple.50" }}
                  >
                    <input {...getInputProps()} />
                    {file ? (
                      <Text>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</Text>
                    ) : (
                      <Text>
                        {isDragActive
                          ? "Solte o arquivo aqui..."
                          : "Arraste e solte um arquivo de vídeo aqui, ou clique para selecionar"}
                      </Text>
                    )}
                  </Box>
                  
                  <FormControl>
                    <FormLabel>Título do Vídeo</FormLabel>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Digite o título do vídeo"
                    />
                  </FormControl>
                  
                  {uploading && (
                    <Box w="100%">
                      <Text mb={1}>Fazendo upload... {progress}%</Text>
                      <Progress value={progress} size="sm" colorScheme="purple" />
                    </Box>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          {tabIndex === 0 ? (
            <Button
              colorScheme="purple"
              onClick={handleAddLink}
              isDisabled={!videoLink}
            >
              Adicionar Link
            </Button>
          ) : (
            <Button
              colorScheme="purple"
              onClick={handleUpload}
              isLoading={uploading}
              isDisabled={!file || uploading}
            >
              Fazer Upload
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadModal; 