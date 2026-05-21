import biome from "@rrlab/biome-plugin";
import { defineConfig } from "@rrlab/cli/config";
import ts from "@rrlab/ts-plugin";
import tsdown from "@rrlab/tsdown-plugin";

export default defineConfig({
  plugins: [biome(), ts(), tsdown()],
});
