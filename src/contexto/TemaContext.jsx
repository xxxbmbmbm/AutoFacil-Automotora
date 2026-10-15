import { createContext, useContext, useEffect, useState } from "react";

const TemaContext = createContext(null);
export const CLAVE_TEMA = "temaAutoFacil";

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem(CLAVE_TEMA) || "claro");

  useEffect(() => {
    document.documentElement.setAttribute("data-tema", tema);
    document.documentElement.setAttribute("data-bs-theme", tema === "oscuro" ? "dark" : "light");
    localStorage.setItem(CLAVE_TEMA, tema);
  }, [tema]);

  const alternarTema = () => setTema((t) => (t === "claro" ? "oscuro" : "claro"));

  return <TemaContext.Provider value={{ tema, alternarTema }}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}
