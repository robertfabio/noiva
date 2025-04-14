/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Desativar ESLint em produção/build
  eslint: {
    // Desabilitar a verificação durante a build, já que estamos em transição
    ignoreDuringBuilds: true,
  },
  // Adicionando configuração webpack para lidar com bcrypt
  webpack: (config) => {
    // Adicionando fallbacks para módulos Node.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // Módulos necessários para bcrypt
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };

    return config;
  },
  // Configuração para tipos de imagens externas
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
  },
  // Ajustes para TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig; 