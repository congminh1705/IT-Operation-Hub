import type { NextConfig } from "next";
import { authMode } from "./src/lib/api/auth-mode";

const mode = authMode();
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (mode === "demo") return [];
    const origin = process.env.ITOH_BACKEND_ORIGIN;
    if (!origin) throw new Error("Real auth requires ITOH_BACKEND_ORIGIN.");
    const backend = new URL(origin);
    if (
      !["http:", "https:"].includes(backend.protocol) ||
      backend.username ||
      backend.password ||
      backend.pathname !== "/" ||
      backend.search ||
      backend.hash
    ) {
      throw new Error("ITOH_BACKEND_ORIGIN must be an HTTP(S) origin.");
    }
    return [
      {
        source: "/api/v1/auth/:path*",
        destination: `${backend.origin}/api/v1/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
