import { Link } from "react-router-dom";
import { useSesion } from "../contexto/SesionContext.jsx";
import AvisoSesionRequerida from "./AvisoSesionRequerida.jsx";
import Icono from "./Icono.jsx";

// Muestra la página solo si el usuario inició sesión y tiene uno de los roles permitidos.
// Es una ayuda de interfaz: la protección real la hace el backend con el JWT de cada petición.
export default function RutaProtegida({ roles, children }) {
  const { usuario, rol } = useSesion();

  if (usuario && roles.includes(rol)) return children;

  return (
    <section className="franja-seccion">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="panel-filtros">
          {usuario ? (
            <div className="text-center py-2">
              <Icono nombre="candado" tamano={28} />
              <h5 className="mt-2 mb-2">No tienes acceso a esta sección</h5>
              <p className="text-muted mb-3">Tu cuenta no tiene permisos para ver esta página.</p>
              <Link to="/" className="boton-secundario">Volver al inicio</Link>
            </div>
          ) : (
            <AvisoSesionRequerida accion="ver esta página" />
          )}
        </div>
      </div>
    </section>
  );
}
