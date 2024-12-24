// app/layout.js

import './globals.css'; // Asegúrate de importar tus estilos globales
import Layout from './componentes/Layout'; // Tu Layout personalizado

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png?v=1" type="image/png" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <title>Paulette Shop</title>
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
  