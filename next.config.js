/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/auth/:path',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${process.env.BE_URL}/api/:path*`,
      },
      {
        source: '/leads/:path*',
        destination: `${process.env.BE_URL}/leads/:path*`,
      },
      {
        source: '/zoom/api/:path*',
        destination: `${process.env.BE_URL}/zoom/api/:path*`,
      },
      {
        source: '/twilio/:path*',
        destination: `https://api.twilio.com/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};


module.exports = nextConfig
