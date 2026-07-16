import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: "/lexis-roodyu-web",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
