import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup, configure } from "@testing-library/react";
import { fetchFalso, reiniciarApiFalsa } from "./apiFalsa.js";

// En un PC cargado o lento, 1 s (el valor por defecto) no alcanza para que aparezcan los datos asíncronos.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-tema");
  document.documentElement.removeAttribute("data-bs-theme");
  window.scrollTo = vi.fn();
  // Cada prueba parte con el backend simulado en su estado inicial.
  reiniciarApiFalsa();
  vi.stubGlobal("fetch", vi.fn(fetchFalso));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
