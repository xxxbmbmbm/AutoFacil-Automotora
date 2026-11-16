import { useSesion } from "../contexto/SesionContext.jsx";

// Se muestra en lugar de un formulario cuando la acción exige haber iniciado sesión.
export default function AvisoSesionRequerida({ accion }) {
  const { setModalAbierto } = useSesion();
  return (
    <div className="text-center py-2">
      <h5 className="mb-2">Inicia sesión para continuar</h5>
      <p className="text-muted mb-3">
        Para {accion} necesitas iniciar sesión o crear una cuenta. Solo toma un minuto.
      </p>
      <button type="button" className="boton-principal" onClick={() => setModalAbierto(true)}>
        Iniciar sesión o crear cuenta
      </button>
    </div>
  );
}
