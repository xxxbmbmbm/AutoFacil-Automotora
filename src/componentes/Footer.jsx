export default function Footer() {
  return (
    <footer className="pie-pagina">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-6">
            <div className="logo-pie mb-2">
              <img src="/images/logo.png" alt="Logo AutoFacil" />
            </div>
            <p className="small mb-0">
              Tu automotora de confianza para comprar y vender vehículos de forma fácil.
            </p>
          </div>
          <div className="col-md-6">
            <h6 className="text-white mb-3">Contacto</h6>
            <p className="small mb-1">📍 Av. Principal 1234, Santiago</p>
            <p className="small mb-1">☎️ +56 9 1234 5678</p>
            <p className="small mb-0">✉️ contacto@autofacil.cl</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
