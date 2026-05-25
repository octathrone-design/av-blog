import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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
