'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Input, Button, VStack, HStack, Text, Avatar, Flex } from '@chakra-ui/react';
import { User } from '@/lib/vercel/auth';

interface Message {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    photoURL?: string;
  };
  timestamp: number;
}

interface ChatBoxProps {
  roomId: string;
  currentUser: User;
  onSendMessage: (message: string) => void;
  messages: Message[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ currentUser, onSendMessage, messages }) => {
  const [newMessage, setNewMessage] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      h="full"
      borderRadius="lg"
      borderWidth="1px"
      overflow="hidden"
      bg="white"
      display="flex"
      flexDirection="column"
    >
      <Box p={3} bg="purple.700" color="white" fontWeight="bold">
        Chat
      </Box>

      <VStack
        flex="1"
        spacing={3}
        p={3}
        overflowY="auto"
        maxH="500px"
        alignItems="stretch"
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={
              message.user.id === currentUser.uid ? 'flex-end' : 'flex-start'
            }
            bg={message.user.id === currentUser.uid ? 'purple.100' : 'gray.100'}
            p={3}
            borderRadius="lg"
            maxW="80%"
          >
            <Flex direction="column">
              {message.user.id !== currentUser.uid && (
                <HStack mb={1}>
                  <Avatar
                    size="xs"
                    name={message.user.name}
                    src={message.user.photoURL}
                  />
                  <Text fontWeight="bold" fontSize="sm">
                    {message.user.name}
                  </Text>
                </HStack>
              )}
              <Text fontSize="md">{message.text}</Text>
              <Text alignSelf="flex-end" fontSize="xs" color="gray.500">
                {formatTime(message.timestamp)}
              </Text>
            </Flex>
          </Box>
        ))}
        <div ref={endOfMessagesRef} />
      </VStack>

      <Box p={3} borderTopWidth="1px">
        <form onSubmit={handleSendMessage}>
          <HStack>
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              borderRadius="full"
            />
            <Button
              type="submit"
              colorScheme="purple"
              borderRadius="full"
              px={6}
              isDisabled={!newMessage.trim()}
            >
              Enviar
            </Button>
          </HStack>
        </form>
      </Box>
    </Box>
  );
};

export default ChatBox; 