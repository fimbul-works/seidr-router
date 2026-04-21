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
    environmentOptions: {
      jsdom: {
        url: "https://fimbul.works/",
      },
    },
    server: {
      deps: {
        inline: [/@fimbul-works\/seidr/],
      },
    },
  },
});
