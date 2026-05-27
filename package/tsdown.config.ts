import { defineLibConfig } from "@rrlab/tsdown-config";
import { defineConfig } from "tsdown";

export default defineConfig([
  defineLibConfig({ entry: "src/lib/index.ts", platform: "neutral" }),
  defineLibConfig({ entry: "src/fs.ts", platform: "node" }),
  defineLibConfig({ entry: "src/vite.ts", platform: "node" }),
  defineLibConfig({ entry: "src/react.tsx", platform: "browser" }),
  defineLibConfig({ entry: "src/zod.ts", platform: "neutral" }),
]);
