"use client";
import React, { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const confirmAppointment = async () => {
    // Lógica para confirmar la cita
    alert('Cita confirmada');
    setModalIsOpen(false);
  };

  useEffect(() => {
    
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-pink-300 to-blue-400">
      {/* SideTop (Header) con degradado sólido rosa a azul */}
      <header className="bg-gradient-to-r from-pink-300 to-blue-400 text-white p-6 text-center shadow-lg flex items-center justify-center">
  <img src="/logo.png" alt="Logo" className="h-12 w-12 mr-4" />
  <h1 className="text-4xl font-semibold">Bienvenido a Paullet Shop</h1>
</header>

      {/* Middle Content (Cuerpo Principal) */}
      <main className="flex-grow flex justify-center items-center p-6">
        {children}
      </main>

      {/* SideBot (Footer) con degradado sólido rosado-azul */}
      <footer className="bg-gradient-to-r from-pink-300 to-blue-400 text-white text-center p-4">
        <p>© 2024 Variedad de Productos</p>
      </footer>

      
    </div>
  );
}