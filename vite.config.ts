import { defineConfig } from 'vite'

// 纯 Phaser 游戏（无 React/Tailwind） - 构建为单文件 HTML，双击即可运行
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 3000,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    // 输出单文件部署包：所有 JS/CSS 内联到 index.html
    cssCodeSplit: false,
    assetsInlineLimit: 100000000, // 100MB - 把所有资源内联为 base64
    rollupOptions: {
      output: {
        codeSplitting: false,
        manualChunks: undefined,
      },
    },
  },
})
