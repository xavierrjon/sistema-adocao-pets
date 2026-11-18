import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // `@test` precisa vir antes de `@` para não ser resolvido como `@/test`.
      "@test": fileURLToPath(new URL("../test/frontend", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    fs: {
      // Os testes ficam na pasta `test/` na raiz do monorepo.
      allow: [repositoryRoot],
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [fileURLToPath(new URL("../test/frontend/helpers/setup.ts", import.meta.url))],
    css: false,
    include: ["../test/frontend/**/*.test.{ts,tsx}"],
  },
});
