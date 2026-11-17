import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    // Los flujos completos escriben muchos campos; en un PC lento 5 s (el valor por defecto) no alcanzan.
    testTimeout: 15000,
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Cobertura de TODA la aplicación: punto de entrada, App, componentes,
      // páginas, contextos y datos (antes solo se medían datos y contextos).
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/**/*.test.{js,jsx}", "src/test/**"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
