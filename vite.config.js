import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(), VitePWA({
    registerType: "autoUpdate",
    workbox: {
        maximumFileSizeToCacheInBytes: 3000000, 
      },
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
    manifest: {
      name: "Uzbekas Pixel",
      short_name: "UZ Pixel",
      description: "Uzbekistonning eng zo'r IT ta'lim platformasi",
      theme_color: "#1e293b",
      icons: [
        { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
  })],
})
