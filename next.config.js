/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["swiper", "ssr-window", "dom7"],

  // lib/strapi.js imports the Redis cache and is also bundled for the browser
  // (components use its media helpers). ioredis needs Node's net/tls, so stub
  // it out of client bundles; lib/cache.js never calls it there anyway.
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = { ...config.resolve.alias, ioredis: false };
    }
    return config;
  },
  images: {
    // Strapi serves uploads with `Cache-Control: max-age=0`, so without this
    // every resized image expired after Next's 60s default and was fetched and
    // re-encoded again — the whole site's images, every minute. Upload URLs
    // carry a `?v=<updatedAt>` stamp (lib/strapi.js), so a replaced file gets
    // a new URL and a day's cache never shows a stale image.
    minimumCacheTTL: 86400,
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

  /**
   * Paths that have moved. Each is indexed or linked from outside the site, so
   * it is permanently redirected rather than dropped — a 301 carries the
   * ranking across instead of stranding it on a 404.
   *
   * `statusCode: 301` rather than `permanent: true`, which emits a 308. Both
   * are permanent and Google honours either, but 301 is the one every legacy
   * crawler, analytics tool and CDN already understands.
   */
  async redirects() {
    return [
      // Project pages moved from /projects/<slug> to /<slug>. `/projects`
      // itself keeps working as the listing page: only the child paths move.
      {
        source: "/projects/:slug",
        destination: "/:slug",
        statusCode: 301,
      },
      // The sitemap index moved to /sitemap_index.xml. /sitemap.xml is the
      // path robots.txt advertised for months and the one Search Console has
      // on file, and crawlers probe it by convention even without robots.txt —
      // so it keeps resolving rather than becoming the site's only 404 that
      // Google checks daily.
      {
        source: "/sitemap.xml",
        destination: "/sitemap_index.xml",
        statusCode: 301,
      },
    ];
  },
};

module.exports = nextConfig;
