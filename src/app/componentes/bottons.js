'use client'; // Asegúrate de que este archivo sea un componente del cliente

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Buttons() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/citas/agendar');
  };

  return (
    <div className="text-center">
      {/* Tienda Button (disabled) con un diseño más suave */}
      <button
        disabled
        className="px-10 py-4 m-4 text-white bg-pink-300 cursor-not-allowed rounded-full shadow-lg hover:opacity-80 transition-opacity duration-300"
      >
        Tienda (Próximamente)
      </button>

      {/* Sacar Cita Button con un estilo interactivo */}
      <button
        onClick={handleRedirect}
        className="px-10 py-4 m-4 text-white bg-pink-500 hover:bg-pink-600 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        Sacar Cita
      </button>
    </div>
  );
}