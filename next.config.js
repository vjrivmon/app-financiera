/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de rendimiento optimizada para aplicaciones financieras
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  
  // Optimizaciones de imagen para iconos y avatars
  images: {
    domains: ['localhost', 'vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers de seguridad para aplicaciones financieras
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // PWA y optimizaciones móviles
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
    ];
  },
  
  // Webpack optimizations - using Next.js defaults
  webpack: (config) => {
    // Permitir que Next.js maneje el code splitting automáticamente
    return config;
  },
  
  // Compilación TypeScript estricta
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint en build
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig; 