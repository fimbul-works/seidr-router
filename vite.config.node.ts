import { resolve } from "node:path";
import seidr from "@fimbul-works/seidr/build";
import { defineConfig, type UserConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [seidr()],
    ssr: {
      noExternal: ["@fimbul-works/seidr"],
    },
    build: {
      outDir: "example/dist/server",
      emptyOutDir: true,
      sourcemap: true,
      target: "esnext",
      rolldownOptions: {
        input: resolve("entry-server.ts"),
        experimental: {
          attachDebugInfo: "none",
        },
        output: {
          dir: "example/dist/server",
          format: "es",
          entryFileNames: () => "[name].js",
        },
        treeshake: true,
        external: ["node:fs", "node:path", "node:async_hooks"],
      },
    },
  } as UserConfig;
});
