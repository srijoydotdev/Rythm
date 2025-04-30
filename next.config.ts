import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qkrvjinzswgsesqcmzpe.supabase.co",
        pathname: "/storage/v1/object/public/**", // Adjust this to match your storage bucket path
      },
    ],
  },
};

module.exports = nextConfig;



export default nextConfig;
