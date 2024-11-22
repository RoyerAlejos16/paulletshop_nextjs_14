"use client"; // Asegúrate de que este archivo sea un componente del cliente
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-calendar/dist/Calendar.css'; // Asegúrate de importar los estilos
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'next/navigation';

export default function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedTime, setSelectedTime] = useState(new Date()); // Establece la fecha y hora actual por defecto
  const [selectedServices, setSelectedServices] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [totalDuration, setTotalDuration] = useState(0); // Duración predeterminada
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceOptions = [
    { value: 'service1', label: 'Pedicure' },
    { value: 'service2', label: 'Manicure' },
    { value: 'service3', label: 'Gelish' },
  ];

  // Obtener citas ocupadas cuando se cambia la fecha activa en el calendario
  const getOccupiedTimes = async (date) => {
    try {
      const response = await axios.get(`/api/appointments?date=${date.toISOString()}`);
      
      // Convertir los tiempos ocupados y las citas a números
      const occupiedTimes = response.data.occupiedTimes.map(time => Number(time));
      const appointments = response.data.appointments.map(appointment => ({
        ...appointment,
        date: Number(appointment.date),
      }));
  
      setOccupiedTimes(occupiedTimes);
      setAppointments(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const nameParam = searchParams.get('name');
    const phoneParam = searchParams.get('phone');
  
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
      setSelectedTime(new Date(dateParam));
    }
    if (nameParam) {
      setName(nameParam);
    }
    if (phoneParam) {
      setPhone(phoneParam);
    }
  }, [searchParams]);

  useEffect(() => {
    getOccupiedTimes(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const durationPerService = 1.25; // Duración predeterminada por servicio
    setTotalDuration(selectedServices.length * durationPerService);
  }, [selectedServices]);

  // Manejar la selección de servicios
  const handleServiceChange = (selectedOptions) => {
    setSelectedServices(selectedOptions);
  };

  const generateAvailableTimes = () => {
    const slots = [];
    const startTime = new Date(selectedDate.setHours(15, 0, 0, 0)); // Comienza a las 3:00 PM en hora de México
    const endTime = new Date(selectedDate.setHours(18, 0, 0, 0)); // Termina a las 6:00 PM en hora de México

    console.log('Horarios ocupados (UTC):', occupiedTimes);

    while (startTime < endTime) {
      // Convertir el tiempo de inicio a UTC en formato numérico
      const startTimeUTC = startTime.getTime() + (6 * 60 * 60 * 1000); // Sumar 6 horas para convertir de GMT-6 a UTC
      const endTimeUTC = startTimeUTC + (15 * 60 * 1000); // Intervalo de 15 minutos

      console.log('Comparando startTimeUTC:', new Date(startTimeUTC).toISOString(), 'con endTimeUTC:', new Date(endTimeUTC).toISOString());

      // Verificar si algún horario ocupado cae dentro del intervalo de tiempo generado
      const isOccupied = occupiedTimes.some(occupied => {
        console.log('Comparando con occupied:', new Date(occupied).toISOString());
        return occupied >= startTimeUTC && occupied < endTimeUTC;
      });

      if (!isOccupied) {
        // Convertir el tiempo de UTC a GMT-6 al regresarlo
        const startTimeGMTMinus6 = new Date(startTimeUTC - (6 * 60 * 60 * 1000));
        slots.push(startTimeGMTMinus6);
      }
      startTime.setMinutes(startTime.getMinutes() + 15); // Intervalos de 15 minutos
    }

    console.log('Horarios disponibles (GMT-6):', slots);
    return slots;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convertir los servicios a una cadena que se pueda enviar en la URL (puedes usar JSON o separar por comas)
    const serviceValues = selectedServices.map(service => service.value).join(',');

    const appointmentData = {
      date: selectedTime.toISOString(),
      services: selectedServices.map(service => service.value),
      name,
      phone,
      totalDuration,
    };

    // Redirigir a la página de confirmación y pasar los datos, incluyendo los servicios
    router.push(`/citas/agendar/confirmacion?date=${selectedTime.toISOString()}&name=${name}&phone=${phone}&services=${serviceValues}&totalDuration=${totalDuration}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Agenda tu cita</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Selecciona la fecha:</label>
            <Calendar
             onChange={(date) => {
              const newDate = new Date(date);
              setSelectedDate(newDate);
              // Actualiza `selectedTime` para que refleje la nueva fecha seleccionada
              setSelectedTime(new Date(newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes())));
            }}
              value={selectedDate}
              tileDisabled={({ date }) => !date}
              className="w-full p-2 border rounded shadow-sm"
              onActiveStartDateChange={({ activeStartDate }) => getOccupiedTimes(activeStartDate)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Selecciona la hora:</label>
            <DatePicker
              selected={selectedTime}
              onChange={(date) => setSelectedTime(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Hora"
              dateFormat="h:mm aa"
              className="w-full p-2 border rounded"
              includeTimes={generateAvailableTimes()}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Selecciona los servicios:</label>
            <Select
              isMulti
              options={serviceOptions}
              onChange={handleServiceChange}
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Nombre:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Número de contacto:</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Duración total: {totalDuration} horas</label>
          </div>

          <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
            Confirmar Cita
          </button>
        </form>
      </div>
    </div>
  );
}