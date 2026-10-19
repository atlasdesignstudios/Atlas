/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera una web 100% estática en la carpeta «out/»: se sube a Netlify,
  // Cloudflare Pages, GitHub Pages o cualquier alojamiento estático gratis.
  output: "export",
  trailingSlash: false,
  images: {
    // Las fotos se sirven tal cual desde /public/assets (ya están en WebP y
    // con width/height declarados). Si un día alojas en Vercel, puedes quitar
    // esto y usar <Image> de next/image para optimización automática.
    unoptimized: true,
  },
};

export default nextConfig;
