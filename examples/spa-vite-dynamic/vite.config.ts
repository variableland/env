import react from "@vitejs/plugin-react";
import { envConfig } from "@vlandoss/env/vite";
import { defineConfig } from "vite";

// envConfig() is enabled here purely for its `__ENV_NAME__` build-time inject:
// it makes `envName()` return the right value in the browser, including custom
// modes like `staging`. The `#config` alias the plugin also registers is not
// consumed by this example (we use a dynamic import instead).
export default defineConfig({
  plugins: [react(), envConfig()],
  server: { port: 5174, strictPort: true },
  preview: { port: 4174, strictPort: true },
});
