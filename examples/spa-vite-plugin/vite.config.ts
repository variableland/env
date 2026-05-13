import react from "@vitejs/plugin-react";
import { envConfig } from "@vlandoss/env/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), envConfig()],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
