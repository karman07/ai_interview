import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Three.js is the heaviest — isolate it completely
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
          // Firebase — large, rarely changes
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase-vendor';
          }
          // Recharts + dependencies
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-')) {
            return 'charts-vendor';
          }
          // Framer Motion
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Radix UI
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          // Icons
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/@heroicons')) {
            return 'icons';
          }
          // PDF
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas') || id.includes('node_modules/html2pdf')) {
            return 'pdf-vendor';
          }
          // Media
          if (id.includes('node_modules/react-player') || id.includes('node_modules/plyr')) {
            return 'media-vendor';
          }
          // Socket.io
          if (id.includes('node_modules/socket.io')) {
            return 'socket-vendor';
          }
          // Axios
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
        dead_code: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    target: 'es2020',
    reportCompressedSize: false,
  },
  server: {
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
    },
    proxy: {
      "/piston": {
        target: "http://localhost:2000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/piston/, ""),
      },
    },
  },
  optimizeDeps: {
    include: ['@react-three/fiber', '@react-three/drei', 'three'],
  },
});
