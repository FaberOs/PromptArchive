import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const frontendRoot = resolve(import.meta.dirname);

export default defineConfig({
  root: frontendRoot,
  resolve: {
    alias: {
      "@": frontendRoot,
    },
  },
  test: {
    environment: "jsdom",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    pool: "forks",
    fileParallelism: false,
  },
});
