import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./estilos.css";
import App from "./App.jsx";
import { TemaProvider } from "./contexto/TemaContext.jsx";
import { SesionProvider } from "./contexto/SesionContext.jsx";
import { VehiculosProvider } from "./contexto/VehiculosContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <TemaProvider>
        <SesionProvider>
          <VehiculosProvider>
            <App />
          </VehiculosProvider>
        </SesionProvider>
      </TemaProvider>
    </BrowserRouter>
  </StrictMode>
);
