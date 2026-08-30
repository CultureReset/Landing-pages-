import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["qrcode"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  typedRoutes: false,
  devIndicators: false,
};

export default config;
