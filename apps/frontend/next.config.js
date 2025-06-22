/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⬇️ Ключевая строка: включает режим static-export
  output: 'export',

  // папка, в которую Next положит готовый статиκ-сайт
  distDir: 'out',

  images: {
    // оптимизатор изображений недоступен при export → отключаем
    unoptimized: true,
    domains: ['localhost', 'images.unsplash.com'],
  },
};
