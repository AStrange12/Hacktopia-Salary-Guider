
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
        hostname: 'ruahtech.com.au',
      },
      {
        protocol: 'https”',
        hostname: 'fonsecaadvisers.com',
      },
      {
        protocol: 'https',
        hostname: 'www.treasury.id',
      },
    ],
  },
};

export default nextConfig;
