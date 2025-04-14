'use client';

import { extendTheme } from "@chakra-ui/react";

// Tema personalizado com a nova paleta de cores
export const theme = extendTheme({
  colors: {
    brand: {
      blackPearl: "#1e272e",
      sophisticatedWhite: "#f5f5f5",
      crimsonWine: "#900C3F",
    },
  },
  styles: {
    global: {
      body: {
        bg: "var(--background)",
        color: "var(--foreground)",
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
      },
      variants: {
        solid: {
          bg: "brand.crimsonWine",
          color: "brand.sophisticatedWhite",
          _hover: {
            bg: "#7D0A36",
          },
        },
      },
    },
  },
});