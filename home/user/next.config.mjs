/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'www.infinitysolutions.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'fonsecaadvisers.com',
      },
      {
        protocol: 'https',
        hostname: 'ruahtech.com.au',
      },
      {
        protocol: 'https',
        hostname: 'www.treasury.id',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        "https://6000-firebase-finai-advisor4-1766575616034.cluster-ubrd2huk7jh6otbgyei4h62ope.cloudworkstations.dev"
    ]
  }
};

export default nextConfig;
