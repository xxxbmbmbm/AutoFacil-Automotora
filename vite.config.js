import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // "Utilidades": datos, funciones de formato y contextos (lógica de sesión, catálogo y tema).
      include: ["src/datos/**/*.js", "src/contexto/**/*.jsx"],
      exclude: ["src/**/*.test.{js,jsx}", "src/test/**"],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});
