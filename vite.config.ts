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
    // Optimize chunk size for better performance
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // Animation libraries
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Icons
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/@heroicons')) {
            return 'icons';
          }
          // 3D libraries (largest)
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
          // Charts
          if (id.includes('node_modules/recharts')) {
            return 'recharts';
          }
          // Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          // SEO
          if (id.includes('node_modules/react-helmet-async')) {
            return 'helmet';
          }
          // PDF generation
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2pdf')) {
            return 'pdf';
          }
          // Socket.io
          if (id.includes('node_modules/socket.io')) {
            return 'socket';
          }
          // Video players
          if (id.includes('node_modules/react-player') || id.includes('node_modules/plyr')) {
            return 'video-player';
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          // Axios
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
          // Web Vitals
          if (id.includes('node_modules/web-vitals')) {
            return 'web-vitals';
          }
        },
        // Optimize asset names
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
    // Disable source maps for production performance
    sourcemap: false,
    // Minify for better performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Increase performance
    reportCompressedSize: false,
  },
  server: {
    proxy: {
      "/piston": {
        target: "http://localhost:2000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/piston/, ""),
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async',
    ],
    exclude: ['three', '@react-three/fiber', '@react-three/drei'],
  },
});
