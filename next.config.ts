import type { NextConfig } from "next";

const authApiUrl = process.env.AUTH_API_URL ?? "http://localhost:8080";
const initiativesApiUrl =
  process.env.INITIATIVES_API_URL ?? "http://localhost:8081";
const quizApiUrl = process.env.QUIZ_API_URL ?? "http://localhost:8082";
const adminApiUrl = process.env.ADMIN_API_URL ?? "http://localhost:8083";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/iniciativas/:path*",
        destination: "/initiatives/:path*",
        permanent: true,
      },
      {
        source: "/feed",
        destination: "/initiatives",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${authApiUrl.replace(/\/$/, "")}/api/auth/:path*`,
      },
      {
        source: "/api/initiatives/:path*",
        destination: `${initiativesApiUrl.replace(/\/$/, "")}/api/initiatives/:path*`,
      },
      {
        source: "/api/quiz/:path*",
        destination: `${quizApiUrl.replace(/\/$/, "")}/api/quiz/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${adminApiUrl.replace(/\/$/, "")}/api/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
