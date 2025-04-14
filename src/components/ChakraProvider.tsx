'use client';

import { ChakraProvider as ChakraProviderOriginal } from "@chakra-ui/react";
import { theme } from "../lib/theme";
import { ReactNode } from "react";

interface ChakraProps {
  children: ReactNode;
}

export function ChakraProvider({ children }: ChakraProps) {
  return (
    <ChakraProviderOriginal theme={theme}>
      {children}
    </ChakraProviderOriginal>
  );
}