import { extendTheme } from '@chakra-ui/react';

const colors = {
  pearlBlack: {
    50: '#f7f7f7',
    100: '#e3e3e3',
    200: '#c8c8c8',
    300: '#a4a4a4',
    400: '#818181',
    500: '#666666',
    600: '#515151',
    700: '#434343',
    800: '#383838',
    900: '#1f1f1f',
  },
  pearlWhite: {
    50: '#ffffff',
    100: '#fefefe',
    200: '#fafafa',
    300: '#f5f5f5',
    400: '#f0f0f0',
    500: '#e8e8e8',
    600: '#e0e0e0',
    700: '#d6d6d6',
    800: '#cccccc',
    900: '#c2c2c2',
  },
  crimsonRed: {
    50: '#ffe5e8',
    100: '#ffb8bf',
    200: '#ff8a96',
    300: '#ff5c6d',
    400: '#ff2e44',
    500: '#dc1428',
    600: '#ac0f20',
    700: '#7c0a17',
    800: '#4c060e',
    900: '#1c0205',
  },
};

const theme = extendTheme({
  colors,
  styles: {
    global: {
      body: {
        bg: 'pearlWhite.50',
        color: 'pearlBlack.900',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'crimsonRed',
      },
    },
    Link: {
      baseStyle: {
        color: 'crimsonRed.500',
        _hover: {
          color: 'crimsonRed.600',
          textDecoration: 'none',
        },
      },
    },
  },
});

export { theme };