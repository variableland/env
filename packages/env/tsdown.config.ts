import { defineConfig } from "@vlandoss/run-run/tools/tsdown";

export default defineConfig([
  {
    entry: "src/lib/index.ts",
    platform: "neutral",
    format: "esm",
    dts: true,
  },
  {
    entry: "src/node.ts",
    platform: "node",
    format: "esm",
    dts: true,
  },
  {
    entry: "src/vite.ts",
    platform: "node",
    format: "esm",
    dts: true,
  },
  {
    entry: "src/react.tsx",
    platform: "browser",
    format: "esm",
    dts: true,
  },
  {
    entry: "src/zod.ts",
    platform: "neutral",
    format: "esm",
    dts: true,
  },
]);
