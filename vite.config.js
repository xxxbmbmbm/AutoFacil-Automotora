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
      // Cobertura de TODA la aplicación: punto de entrada, App, componentes,
      // páginas, contextos y datos (antes solo se medían datos y contextos).
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/**/*.test.{js,jsx}", "src/test/**"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
