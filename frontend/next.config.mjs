/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Local dev: proxy /api to Django. On Vercel, vercel.json routes /api to app.py.
    const djangoUrl = process.env.DJANGO_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${djangoUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
