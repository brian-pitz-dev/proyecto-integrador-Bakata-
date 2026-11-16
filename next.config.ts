import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // la pestaña Estadísticas pasó a llamarse Progreso: los links y favoritos viejos siguen andando
  async redirects() {
    return [{ source: "/estadisticas", destination: "/progreso", permanent: true }];
  },
  experimental: {
    serverActions: {
      // fotos de progreso: el navegador las achica a 200-600 KB; subirFoto corta en 1,5 MB
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
