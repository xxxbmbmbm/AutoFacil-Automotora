import Icono from "./Icono.jsx";

export default function Footer() {
  return (
    <footer className="pie-pagina">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-6">
            <div className="logo-pie mb-3">
              <img src="/images/logo.png" alt="Logo AutoFacil" />
            </div>
            <p className="mb-0">
              Tu automotora de confianza para comprar y vender vehículos de forma fácil
            </p>
          </div>
          <div className="col-md-6">
            <h6 className="mb-3">Contacto</h6>
            <p className="dato-pie mb-2"><Icono nombre="ubicacion" tamano={16} />Av. Principal 1234, Santiago</p>
            <p className="dato-pie mb-2"><Icono nombre="telefono" tamano={16} />+56 9 1234 5678</p>
            <p className="dato-pie mb-0"><Icono nombre="correo" tamano={16} />contacto@autofacil.cl</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
