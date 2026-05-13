import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { envConfig } from "@vlandoss/env/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tanstackStart(), react(), envConfig()],
  server: { port: 3003, strictPort: true },
});
