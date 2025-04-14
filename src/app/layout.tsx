'use client';

import { Inter, Roboto_Mono, Diphylleia } from "next/font/google";
import { AuthProvider } from "../hooks/useAuth";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ChakraProvider } from "../components/ChakraProvider";
import { Box } from "@chakra-ui/react";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const diphylleia = Diphylleia({
  variable: "--font-diphylleia",
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Noiva - Watch Together</title>
        <meta name="description" content="Watch movies together with your loved ones" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} ${diphylleia.variable} antialiased`}
      >
        <ChakraProvider>
          <AuthProvider>
            <Navbar />
            <Box as="main" minH="calc(100vh - 180px)">
              {children}
            </Box>
            <Footer />
            <Toaster position="top-right" />
            <Analytics />
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
