/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@dse/shared", "@dse/ict-engine", "@dse/dse-data"],
};

module.exports = nextConfig;
