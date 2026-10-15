import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { TemaProvider, useTema, CLAVE_TEMA } from "./TemaContext.jsx";

const montar = () => renderHook(() => useTema(), { wrapper: TemaProvider });

describe("TemaContext", () => {
  it("por defecto usa el modo claro y lo aplica al documento", () => {
    const { result } = montar();
    expect(result.current.tema).toBe("claro");
    expect(document.documentElement).toHaveAttribute("data-tema", "claro");
    expect(document.documentElement).toHaveAttribute("data-bs-theme", "light");
  });

  it("restaura el tema oscuro guardado", () => {
    localStorage.setItem(CLAVE_TEMA, "oscuro");
    const { result } = montar();
    expect(result.current.tema).toBe("oscuro");
    expect(document.documentElement).toHaveAttribute("data-bs-theme", "dark");
  });

  it("alterna entre claro y oscuro y lo persiste", () => {
    const { result } = montar();
    act(() => result.current.alternarTema());
    expect(result.current.tema).toBe("oscuro");
    expect(localStorage.getItem(CLAVE_TEMA)).toBe("oscuro");
    expect(document.documentElement).toHaveAttribute("data-tema", "oscuro");
    act(() => result.current.alternarTema());
    expect(result.current.tema).toBe("claro");
    expect(document.documentElement).toHaveAttribute("data-bs-theme", "light");
  });
});
