export default function EncabezadoPagina({ etiqueta, titulo, subtitulo }) {
  return (
    <header className="py-5 encabezado-pagina">
      <div className="container">
        <p className="etiqueta-hero mb-1">{etiqueta}</p>
        <h1 className="mb-2">{titulo}</h1>
        <p className="subtitulo-hero mb-0">{subtitulo}</p>
      </div>
    </header>
  );
}
