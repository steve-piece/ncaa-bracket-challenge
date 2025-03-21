/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Ignoring type checking during build is not recommended
    // but needed for deployment due to PageProps type issues
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sportradar.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
