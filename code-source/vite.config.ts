import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Configuration pour le serveur de développement (npm run dev)
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
  // Configuration cruciale pour la commande de preview sur Render (npm run preview)
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 10000,
    allowedHosts: ["salariee-plus.onrender.com", ".onrender.com"],
  },
});