import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@monaco-editor/react",
      "react-syntax-highlighter",
    ],
  },

 
  compiler: {
   
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    
    formats: ["image/avif", "image/webp"],
  },

  
  poweredByHeader: false,
};

export default nextConfig;
