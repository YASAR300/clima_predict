import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,

  // Image optimization (Next 16 compatible)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Webpack config (PWA needs Webpack)
  webpack: (config) => {
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };
    return config;
  }
};

// Wrap with PWA (no experimental or removed keys)
export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',

  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'openweather-api',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 600, // 10 min
        },
        networkTimeoutSeconds: 5,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 2592000, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 31536000, // 1 year
        },
      },
    },
  ],
})(nextConfig);
