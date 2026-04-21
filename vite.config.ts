import { resolve } from "node:path";
import seidr from "@fimbul-works/seidr/build";
import { defineConfig, type UserConfig } from "vite";

export default defineConfig(() => {
  return {
    root: "example",
    plugins: [seidr({ disableSSR: false })],
    ssr: {
      noExternal: ["@fimbul-works/seidr"],
    },
    build: {
      outDir: "example/dist/client",
      emptyOutDir: true,
      sourcemap: true,
      minify: "terser",
      target: "esnext",
      rolldownOptions: {
        input: resolve("example", "index.html"),
        output: {
          dir: "example/dist/client",
          format: "es",
          entryFileNames: () => "[name].js",
        },
        treeshake: true,
        external: ["node:fs", "node:path", "node:async_hooks"],
      },
    },
  } as UserConfig;
});
