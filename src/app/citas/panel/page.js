'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AppointmentsPage = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('todos'); // Estado para el filtro
  const [filterDate, setFilterDate] = useState(null); // Estado para el filtro por fecha
  const [currentPage, setCurrentPage] = useState(1); // Estado para la paginación
  const appointmentsPerPage = 5; // Número de citas por página

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('/api/appointments', { params: { vista: 1 } });
        setAppointments(response.data.appointments); // Asegúrate de que la respuesta sea un arreglo
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  const handleConfirm = async (id) => {
    try {
      const response = await axios.post('/api/appointments/status', { id, status: 1 });
      console.log('Cita confirmada:', response.data);
      // Actualizar el estado de la cita en el frontend
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status: 'confirmado' } : appointment
        )
      );
    } catch (error) {
      console.error('Error al confirmar la cita:', error);
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await axios.post('/api/appointments/status', { id, status: 0 });
      console.log('Cita cancelada:', response.data);
      // Actualizar el estado de la cita en el frontend
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status: 'cancelado' } : appointment
        )
      );
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
    }
  };

  const handleComplete = async (id) => {
    try {
      const response = await axios.post('/api/appointments/status', { id, status: 2 });
      console.log('Cita cumplida:', response.data);
      // Actualizar el estado de la cita en el frontend
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status: 'asistida' } : appointment
        )
      );
    } catch (error) {
      console.error('Error al completar la cita:', error);
    }
  };

  const handleNoShow = async (id) => {
    try {
      const response = await axios.post('/api/appointments/status', { id, status: 3 });
      console.log('Cita no asistida:', response.data);
      // Actualizar el estado de la cita en el frontend
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status: 'no asistio' } : appointment
        )
      );
    } catch (error) {
      console.error('Error al marcar la cita como no asistida:', error);
    }
  };

  const handleReschedule = async (id) => {
    try {
      const response = await axios.post('/api/appointments/status', { id, status: 4 });
      console.log('Cita reprogramada:', response.data);
      // Actualizar el estado de la cita en el frontend
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status: 'reprogramada' } : appointment
        )
      );
    } catch (error) {
      console.error('Error al reprogramar la cita:', error);
    }
  };

  const filteredAppointments = appointments
    .filter((appointment) => {
      if (filterStatus !== 'todos' && appointment.status !== filterStatus) {
        return false;
      }
      if (filterDate && new Date(Number(appointment.date)).toDateString() !== filterDate.toDateString()) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(Number(a.date)) - new Date(Number(b.date))); // Ordenar por fecha y hora

  // Paginación
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <main className="flex-grow flex justify-center items-center p-6">
      <div className="max-w-4xl w-full mx-auto p-4 bg-white bg-opacity-80 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Citas Agendadas</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Filtrar por estado:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="todos">Todos</option>
            <option value="solicitado">Solicitado</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="asistida">Cumplida</option>
            <option value="no asistio">No asistio</option>
            <option value="reprogramada">Reprogramada</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Filtrar por fecha:</label>
          <DatePicker
            selected={filterDate}
            onChange={(date) => setFilterDate(date)}
            dateFormat="dd/MM/yyyy"
            className="w-full p-2 border rounded"
            isClearable
            placeholderText="Selecciona una fecha"
          />
        </div>
        {currentAppointments.length === 0 ? (
          <p className="text-center text-lg text-gray-700">No hay citas agendadas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentAppointments.map((appointment) => {
              const startDate = new Date(Number(appointment.date));
              const endDate = new Date(startDate.getTime() + appointment.duration * 60 * 60 * 1000);
              return (
                <div key={appointment.id} className="bg-white p-4 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-2">{appointment.name}</h2>
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
                    <span className="font-semibold">Teléfono:</span> {appointment.number}
                  </p>
                  <p className="text-lg mb-2">
                    <span className="font-semibold">Servicios:</span> {appointment.service}
                  </p>
                  <p className="text-lg mb-4">
                    <span className="font-semibold">Duración Total:</span>{' '}
                    {Math.floor(appointment.duration)} horas{' '}
                    {Math.round((appointment.duration % 1) * 60)} minutos
                  </p>
                  <div className="flex justify-between">
  {appointment.status === 'solicitado' && (
    <>
      <button
        onClick={() => handleConfirm(appointment.id)}
        className="bg-green-500 text-white py-1 px-2 rounded text-sm hover:bg-green-600"
      >
        Confirmar
      </button>
      <button
        onClick={() => handleCancel(appointment.id)}
        className="bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600"
      >
        Cancelar
      </button>
    </>
  )}
  {appointment.status === 'confirmado' && (
    <>
      <button
        onClick={() => handleCancel(appointment.id)}
        className="bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600"
      >
        Cancelar
      </button>
      <button
        onClick={() => handleComplete(appointment.id)}
        className="bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600"
      >
        Cumplida
      </button>
      <button
        onClick={() => handleNoShow(appointment.id)}
        className="bg-yellow-500 text-white py-1 px-2 rounded text-sm hover:bg-yellow-600"
      >
        No asistio
      </button>
    </>
  )}
  {appointment.status === 'cancelado' && (
    <button
      onClick={() => handleReschedule(appointment.id)}
      className="bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600"
    >
      Reprogramar
    </button>
  )}        </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(filteredAppointments.length / appointmentsPerPage) }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AppointmentsPage;