import { seidrBundlePlugin } from "@fimbul-works/seidr/build";
import type { InputOptions } from "rolldown";
import { defineConfig } from "tsdown";

const inputOptions: InputOptions = {
  optimization: {
    inlineConst: false,
  },
};

export default defineConfig([
  {
    entry: {
      "seidr-router": "src/index.ts",
    },
    platform: "browser",
    format: ["esm", "cjs"],
    target: "es2022",
    dts: true,
    treeshake: true,
    outDir: "bundles",
    plugins: [seidrBundlePlugin({ disableSSR: false })],
    inputOptions,
  },
]);
