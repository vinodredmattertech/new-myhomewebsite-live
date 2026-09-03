/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["swiper", "ssr-window", "dom7"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backend.myhomeconstructions.com",
      },
      {
        protocol: "http",
        hostname: "65.1.74.145",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
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
