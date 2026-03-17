import { defineConfig } from "tsdown";
import { removeRegionComments } from "./scripts/remove-region-comments.ts";

export default defineConfig({
  entry: { "seidr-router": "./src/index.ts" },
  platform: "neutral",
  format: ["esm", "cjs"],
  target: "es2024",
  dts: true,
  clean: true,
  outDir: "dist",
  plugins: [removeRegionComments()],
  deps: { neverBundle: ["@fimbul-works/seidr"] },
});
