import type { NextConfig } from "next";

// Domínio da API publicada na Vercel (backend Express).
// O rewrite torna as chamadas de API same-origin no frontend publicado: a
// sessão passa a ser um cookie first-party (exigido pelo iOS/Safari, que
// bloqueia cookies de terceiros, e pela descontinuação deles no Chrome).
const API_ORIGIN = "https://adoteja-api.vercel.app";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // URLs de fotos dos animais servidas pelo Cloudinary (armazenamento do backend).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        // As rewrites padrão são aplicadas após páginas e arquivos públicos;
        // como o frontend não possui rotas em /api, todo /api/* é proxyado.
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
