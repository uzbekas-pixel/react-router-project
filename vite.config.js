import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(),tailwindcss(), VitePWA({
    registerType: "autoUpdate",
    injectRegister: 'script',
    devOptions: {
      enabled: true,
      suppressWarnings: false,
      type: 'classic'
    },
    strategies: 'generateSW',
    workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 3000000, 
      },
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
    manifest: {
      name: "Uzbekas Pixel — Online Kurslar",
      short_name: "EduZone",
      description: "Uzbekistonning eng zo'r IT ta'lim platformasi",
      theme_color: "#1e293b",
      background_color: "#0f172a",
      display: "standalone",
      start_url: "/",
      orientation: "portrait-primary",
      icons: [
        { 
          src: "/icons/icon-192.png", 
          sizes: "192x192", 
          type: "image/png",
          purpose: "any maskable"
        },
        { 
          src: "/icons/icon-512.png", 
          sizes: "512x512", 
          type: "image/png",
          purpose: "any maskable"
        },
      ],
    },
  })],
})
