/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "72.61.250.57",
      },
      {
        protocol: "http",
        hostname: "youtu.be",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "youtube",
      },
      {
        protocol: "https",
        hostname: "youtube.com",
      },
    ],
  },
};

module.exports = nextConfig;
