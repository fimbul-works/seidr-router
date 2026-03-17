import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["import", "node"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    server: {
      deps: {
        inline: [/@fimbul-works\/seidr/],
      },
    },
  },
  define: {
    __SEIDR_DEV__: true,
    "process.env.USE_SCHEDULER": "false",
  },
});
