import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    outputFileTracingIncludes: {
        '/api/assistant': ['./majesticrp/**/*', './crystalrp/**/*', './public/**/*']
    }
};

export default nextConfig;
