import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow images from the preview domain for development
      {
        protocol: "https",
        hostname: "*.hostingersite.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "blog.avdesignintl.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "wp-admin.avdesignintl.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
