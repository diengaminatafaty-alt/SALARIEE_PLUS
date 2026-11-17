import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * L'hôte de prévisualisation de ce chat est fourni via VITE_ALLOWED_HOSTS
 * (liste séparée par des virgules). Aucun joker n'est utilisé.
 */
const allowedHosts = (process.env.VITE_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    allowedHosts,
  },
});
