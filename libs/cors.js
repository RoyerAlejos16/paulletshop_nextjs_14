import Cors from 'cors';

// Inicializa el middleware con las configuraciones necesarias
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  origin: '*', // Cambia '*' por el dominio permitido en producción
});

// Helper para usar el middleware en API routes
export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
export function corsMiddleware() {
  return {
    origin: '*', // Permitir todos los orígenes (puedes personalizar esto)
    methods: ['GET', 'POST', 'OPTIONS'], // Métodos permitidos
    headers: ['Content-Type', 'Authorization'], // Encabezados permitidos
  };
}


export default corsMiddleware;
