// app/layout.js

import './globals.css'; // Asegúrate de importar tus estilos globales
import Layout from './componentes/Layout'; // Tu Layout personalizado

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Tienda Virtual</title>
      </head>
      <body>
        {/* Aquí insertas tu layout que envuelve el contenido */}
        <div id="__next">

        <Layout>{children}</Layout>
      </div>
      </body>

    </html>
  );
}
