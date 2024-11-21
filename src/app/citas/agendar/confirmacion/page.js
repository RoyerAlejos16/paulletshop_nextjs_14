"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

const ConfirmationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointmentData, setAppointmentData] = useState(null);

  // Usamos useEffect para esperar a que los parámetros estén disponibles
  useEffect(() => {
    const date = searchParams.get('date');
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');
    const services = searchParams.get('services');
    const totalDuration = searchParams.get('totalDuration');

    console.log('Parametros obtenidos:', { date, name, phone, services, totalDuration });

    if (date && name && phone && services && totalDuration) {
      // Aseguramos que la fecha esté en el formato correcto
      const formattedDate = new Date(date).toISOString();

      setAppointmentData({
        date: formattedDate,
        name,
        phone,
        services: services.split(','), // Convertir la cadena de servicios en un array
        totalDuration,
      });

      console.log('Datos de la cita:', {
        date: formattedDate,
        name,
        phone,
        services: services.split(','),
        totalDuration,
      });
    }
  }, [searchParams]);

  const handleEdit = () => {
    // Redirigir a la página anterior con los datos
    router.push(`/citas/agendar?date=${searchParams.get('date')}&name=${searchParams.get('name')}&phone=${searchParams.get('phone')}&services=${searchParams.get('services')}&totalDuration=${searchParams.get('totalDuration')}`);
  };

  const handleConfirm = async () => {
    const data = {
      date: searchParams.get('date'),
      service: searchParams.get('services').split(','),
      duration: searchParams.get('totalDuration'),
      status: 'solicitado',
      number: searchParams.get('phone'),
      name: searchParams.get('name'),
    };

    console.log('Datos enviados:', data);

    try {
      const response = await axios.post('http://localhost:3000/api/appointments', data);
      console.log('Cita creada:', response.data);
      alert('Cita confirmada');
    } catch (error) {
      console.error('Error al crear la cita:', error);
      alert('Error al confirmar la cita');
    }
  };

  if (!appointmentData) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>Confirmación de Cita</h1>
      <p>Fecha: {new Date(appointmentData.date).toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })}</p>
      <p>Nombre: {appointmentData.name}</p>
      <p>Teléfono: {appointmentData.phone}</p>
      <p>Servicios: {appointmentData.services.join(', ')}</p>
      <p>Duración Total: {appointmentData.totalDuration} horas</p>
      <button onClick={handleConfirm} className="bg-green-500 text-white py-2 px-4 rounded mr-2">Realizar Cita</button>
      <button onClick={handleEdit} className="bg-blue-500 text-white py-2 px-4 rounded">Editar Cita</button>
    </div>
  );
};

export default ConfirmationPage;