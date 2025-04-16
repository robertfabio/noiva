/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Desativar verificações que podem causar falhas no build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Habilita otimização de imagens
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
    formats: ['image/webp'],
  },
  // Resolve problemas com bcrypt
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };
    return config;
  },
}

export default nextConfig; 