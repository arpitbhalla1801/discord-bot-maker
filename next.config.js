/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['discord.js', '@discordjs/ws', '@discordjs/rest', 'zlib-sync'],
  },
  webpack: (config, { isServer }) => {
    // Exclude Discord.js from client bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'discord.js': false,
        '@discordjs/ws': false,
        '@discordjs/rest': false,
        '@discordjs/voice': false,
        'undici': false,
        'zlib-sync': false,
      };
    }
    
    // Mark as external for server to avoid bundling
    if (isServer) {
      config.externals = [
        ...config.externals || [],
        'discord.js',
        '@discordjs/ws',
        '@discordjs/rest',
        'zlib-sync',
      ];
    }
    
    return config;
  },
}

module.exports = nextConfig
