'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

const ConfirmationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointmentData, setAppointmentData] = useState(null);

  useEffect(() => {
    const date = searchParams.get('date');
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');
    const services = searchParams.get('services');
    const totalDuration = searchParams.get('totalDuration');

    if (date && name && phone && services && totalDuration) {
      const formattedDate = new Date(date).toISOString();

      setAppointmentData({
        date: formattedDate,
        name,
        phone,
        services: services.split(','),
        totalDuration: parseFloat(totalDuration),
      });
    } else {
      router.push('/citas/agendar');
    }
  }, [searchParams, router]);

  const handleEdit = () => {
    router.push(
      `/citas/agendar?date=${searchParams.get('date')}&name=${searchParams.get(
        'name'
      )}&phone=${searchParams.get('phone')}&services=${searchParams.get(
        'services'
      )}&totalDuration=${searchParams.get('totalDuration')}`
    );
  };

  const handleConfirm = async () => {
    const data = {
      date: appointmentData.date,
      service: appointmentData.services,
      duration: appointmentData.totalDuration,
      status: 'solicitado',
      number: appointmentData.phone,
      name: appointmentData.name,
    };

    try {
      const response = await axios.post('/api/appointments', data);
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

  const startDate = new Date(appointmentData.date);
  const endDate = new Date(
    startDate.getTime() + appointmentData.totalDuration * 60 * 60 * 1000
  );

  return (
    <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Confirmación de Cita</h1>
      <p className="text-lg mb-2">
        <span className="font-semibold">Fecha:</span>{' '}
        {startDate.toLocaleString('es-ES', {
          timeZone: 'America/Mexico_City',
          hour12: true,
        })}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Hora de Finalización:</span>{' '}
        {endDate.toLocaleString('es-ES', {
          timeZone: 'America/Mexico_City',
          hour12: true,
        })}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Nombre:</span> {appointmentData.name}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Teléfono:</span> {appointmentData.phone}
      </p>
      <p className="text-lg mb-2">
        <span className="font-semibold">Servicios:</span>{' '}
        {appointmentData.services.join(', ')}
      </p>
      <p className="text-lg mb-4">
        <span className="font-semibold">Duración Total:</span>{' '}
        {Math.floor(appointmentData.totalDuration)} horas{' '}
        {Math.round((appointmentData.totalDuration % 1) * 60)} minutos
      </p>

      <div className="flex justify-between mb-4">
        <button
          onClick={handleEdit}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Editar Cita
        </button>
        <button
          onClick={handleConfirm}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Realizar Cita
        </button>
      </div>

      <p className="text-sm text-red-500 text-center">
        Por favor, verifique que el número de teléfono sea correcto para recibir
        la confirmación de la cita.
      </p>
    </div>
  );
};

export default ConfirmationPage;
