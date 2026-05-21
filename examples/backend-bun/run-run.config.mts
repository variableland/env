import biome from "@rrlab/biome-plugin";
import { defineConfig } from "@rrlab/cli/config";
import ts from "@rrlab/ts-plugin";

export default defineConfig({
  plugins: [biome(), ts()],
});
