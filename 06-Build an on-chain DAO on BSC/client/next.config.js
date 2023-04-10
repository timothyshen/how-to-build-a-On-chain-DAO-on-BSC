/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    LOCAL_NODE: "",
    CONTRACTADDRESS: "",
  }
}

module.exports = nextConfig
