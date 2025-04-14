'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { FaBars, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [authChecked, setAuthChecked] = useState(false);

  // Esperando pela verificação inicial de autenticação
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box>
      <Flex
        bg="var(--sophisticated-white)"
        color="var(--black-pearl)"
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor="rgba(144, 12, 63, 0.2)"
        align={'center'}
        position="sticky"
        top={0}
        zIndex={1000}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <Button
            onClick={onToggle}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          >
            <Icon as={isOpen ? FaTimes : FaBars} />
          </Button>
        </Flex>
        
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Link href="/" passHref>
            <Text
              as="span"
              textAlign={{ base: 'center', md: 'left' }}
              fontFamily="var(--font-diphylleia)"
              fontSize="2xl"
              color="var(--crimson-wine)"
              display="flex"
              alignItems="center"
              cursor="pointer"
            >
              Noiva
            </Text>
          </Link>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav pathname={pathname} />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {loading ? (
            <Spinner size="sm" color="var(--crimson-wine)" />
          ) : user && authChecked ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <HStack>
                  <Avatar
                    size={'sm'}
                    src={user.photoURL || undefined}
                    name={user.displayName || 'Usuário'}
                  />
                  <Text display={{ base: 'none', md: 'block' }}>
                    {user.displayName || 'Perfil'}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as={Link} href="/profile">
                  Meu Perfil
                </MenuItem>
                <MenuItem as={Link} href="/profile">
                  Minhas Salas
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button
                bg={'var(--crimson-wine)'}
                color={'var(--sophisticated-white)'}
                _hover={{ bg: '#7D0A36' }}
                size={'sm'}
                mr={4}
                as={Link}
                href="/auth/login"
                fontSize={'sm'}
                fontWeight={400}
              >
                Entrar
              </Button>
              <Button
                variant={'outline'}
                borderColor={'var(--crimson-wine)'}
                color="var(--crimson-wine)"
                _hover={{ bg: 'var(--crimson-wine)', color: 'var(--sophisticated-white)' }}
                size={'sm'}
                as={Link}
                href="/auth/signup"
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
              >
                Criar Conta
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav pathname={pathname} />
      </Collapse>
    </Box>
  );
}

const DesktopNav = ({ pathname }: { pathname: string }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('var(--crimson-wine)', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const { user } = useAuth();

  // Filtra os itens de navegação com base no estado de autenticação
  const filteredNavItems = NAV_ITEMS.filter(item => {
    // Se o usuário não estiver logado e o item for 'Salas', não mostrar
    if (!user && item.href === '/profile') {
      return false;
    }
    return true;
  });

  return (
    <Stack direction={'row'} spacing={4} alignItems="center">
      {filteredNavItems.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link href={navItem.href ?? '#'} passHref>
                <Box
                  as="span"
                  p={2}
                  fontSize={'sm'}
                  fontWeight={pathname === navItem.href ? 600 : 500}
                  color={pathname === navItem.href ? 'var(--crimson-wine)' : linkColor}
                  _hover={{
                    textDecoration: 'none',
                    color: linkHoverColor,
                  }}
                  borderBottom={pathname === navItem.href ? '2px solid' : 'none'}
                  borderColor="var(--crimson-wine)"
                  cursor="pointer"
                >
                  {navItem.label}
                </Box>
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link href={href ?? '#'} passHref>
      <Box
        as="span"
        role={'group'}
        display={'block'}
        p={2}
        rounded={'md'}
        _hover={{ bg: useColorModeValue('purple.50', 'gray.900') }}
        cursor="pointer"
      >
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'var(--crimson-wine)' }}
              fontWeight={500}
            >
              {label}
            </Text>
            <Text fontSize={'sm'}>{subLabel}</Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify={'flex-end'}
            align={'center'}
            flex={1}
          >
            <Icon color={'var(--crimson-wine)'} w={5} h={5} as={FaChevronRight} />
          </Flex>
        </Stack>
      </Box>
    </Link>
  );
};

const MobileNav = ({ pathname }: { pathname: string }) => {
  const { user } = useAuth();

  // Filtra os itens de navegação com base no estado de autenticação
  const filteredNavItems = NAV_ITEMS.filter(item => {
    // Se o usuário não estiver logado e o item for 'Salas', não mostrar
    if (!user && item.href === '/profile') {
      return false;
    }
    return true;
  });
  
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {filteredNavItems.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} isActive={pathname === navItem.href} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, isActive }: NavItem & { isActive: boolean }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Link href={href ?? '#'} passHref>
        <Flex
          py={2}
          justify={'space-between'}
          align={'center'}
          _hover={{
            textDecoration: 'none',
          }}
        >
          <Text
            fontWeight={isActive ? 700 : 600}
            color={isActive ? 'var(--crimson-wine)' : 'gray.600'}
          >
            {label}
          </Text>
          {children && (
            <Icon
              as={FaChevronDown}
              transition={'all .25s ease-in-out'}
              transform={isOpen ? 'rotate(180deg)' : ''}
              w={6}
              h={6}
            />
          )}
        </Flex>
      </Link>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} href={child.href ?? '#'} passHref>
                <Box as="span" py={2} cursor="pointer">
                  {child.label}
                </Box>
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Salas',
    href: '/profile',
  },
  {
    label: 'Como Funciona',
    href: '/about',
  },
];