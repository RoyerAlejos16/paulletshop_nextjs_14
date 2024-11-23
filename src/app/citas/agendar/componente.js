'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-calendar/dist/Calendar.css'; // Asegúrate de importar los estilos
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setHours, setMinutes } from 'date-fns';

export default function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedTime, setSelectedTime] = useState(new Date()); // Establece la fecha y hora actual por defecto
  const [selectedServices, setSelectedServices] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [totalDuration, setTotalDuration] = useState(0); // Duración predeterminada
  const [freeTime, setFreeTime] = useState({
    '2023-11-01': 180, // 3 horas libres
    '2023-11-02': 90,  // 1.5 horas libres
    '2023-11-03': 30,  // 0.5 horas libres
    '2023-11-04': 0,   // No hay tiempo libre
  }); // Tiempo libre por fecha
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceDurations = {
    Pedicure: 1.5, // Ejemplo: Pedicure toma 1.5 horas
    Manicure: 1,
    Gelish: 1.25,
    "Pintura Tradicional": 1,
  };
  
  // Calcula la duración total cada vez que cambian los servicios
  useEffect(() => {
    const total = selectedServices.reduce(
      (sum, service) => sum + (serviceDurations[service] || 0),
      0
    );
    setTotalDuration(total);
  }, [selectedServices]);
  
  const serviceOptions = [
    { value: 'Pedicure', label: 'Pedicure' },
    { value: 'Manicure', label: 'Manicure' },
    { value: 'Gelish', label: 'Gelish' },
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

      // Calcular el tiempo libre por fecha
      const freeTime = calculateFreeTime(occupiedTimes);
      setFreeTime(freeTime);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error fetching appointments. Please try again.');
    }
  };

  const calculateFreeTime = (occupiedTimes) => {
    const freeTime = {};
    occupiedTimes.forEach(time => {
      const date = new Date(time).toISOString().split('T')[0];
      if (!freeTime[date]) {
        freeTime[date] = 0;
      }
      freeTime[date] += 15; // Asumiendo intervalos de 15 minutos
    });
    return freeTime;
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
    let startHour, endHour;
    const month = selectedDate.getMonth();
   if (month === 10) { // Noviembre
      startHour = 15; // 3:00 PM
      endHour = 18; // 6:00 PM
    } else if (month === 11) { // Diciembre
      startHour = 11; // 2:00 PM
      endHour = 18; // 5:00 PM
    } else {
      startHour = 15; // 9:00 AM
      endHour = 18; // 5:00 PM
    }
    const startTime = new Date(selectedDate.setHours(startHour, 0, 0, 0));
    const endTime = new Date(selectedDate.setHours(endHour, 0, 0, 0));
    // Filtrar los horarios ocupados para el día seleccionado
    const occupiedTimesForDay = occupiedTimes.filter(time => {
      const occupiedDate = new Date(time);
      return occupiedDate.toDateString() === selectedDate.toDateString();
    });
  
    console.log('Horarios ocupados (UTC) para el día seleccionado:', occupiedTimesForDay);
  
    while (startTime < endTime) {
      // Convertir el tiempo de inicio a UTC en formato numérico
      const startTimeUTC = startTime.getTime() ; // Sumar 6 horas para convertir de GMT-6 a UTC
      const endTimeUTC = startTimeUTC + (15 * 60 * 1000); // Intervalo de 15 minutos
  
      console.log('Comparando startTimeUTC:', new Date(startTimeUTC).toISOString(), 'con endTimeUTC:', new Date(endTimeUTC).toISOString());
  
      // Verificar si algún horario ocupado cae dentro del intervalo de tiempo generado
      const isOccupied = occupiedTimesForDay.some(occupied => {
        const occupiedStart = new Date(occupied).toISOString();
        const startTimeString = new Date(startTimeUTC).toISOString();
        const endTimeString = new Date(endTimeUTC).toISOString();
        const result = occupied >= startTimeUTC && occupied < endTimeUTC;
        console.log(`Comparando ${occupiedStart} con intervalo ${startTimeString} - ${endTimeString}: ${result}`);
        return result;
      });
  
      if (!isOccupied) {
        // Convertir el tiempo de UTC a GMT-6 al regresarlo
        const startTimeGMTMinus6 = new Date(startTimeUTC);
        slots.push(startTimeGMTMinus6);
      }
      startTime.setMinutes(startTime.getMinutes() + 75); // Intervalos de 15 minutos
    }
  
    console.log('Horarios disponibles (GMT-6):', slots);
    return slots;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const serviceValues = selectedServices.join(',');

    // Convertir los servicios a una cadena que se pueda enviar en la URL (puedes usar JSON o separar por comas)
    //const serviceValues = selectedServices.map(service => service.value).join(',');
    console.log('selectedServices:', selectedServices);
    const appointmentData = {
      date: selectedTime.toISOString(),
      //services: selectedServices.map(service => service.value),
      services:selectedServices,
      name,
      phone,
      totalDuration,
    };
    console.log('appointmentData:', appointmentData);
    // Redirigir a la página de confirmación y pasar los datos, incluyendo los servicios
    router.push(`/citas/agendar/confirmacion?date=${selectedTime.toISOString()}&name=${name}&phone=${phone}&services=${serviceValues}&totalDuration=${totalDuration}`);
  };

  const availableTimes = generateAvailableTimes();

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <ToastContainer />
      <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Agenda tu cita</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Selecciona la fecha:</label>
            <Calendar
              onChange={(date) => {
                setSelectedDate(new Date(date));
                setSelectedTime(new Date(date)); // Asegúrate de actualizar también la hora
              }}
              value={selectedDate}
              tileDisabled={({ date }) => !date}
              className="w-full p-2 border rounded shadow-sm"
              onActiveStartDateChange={({ activeStartDate }) => getOccupiedTimes(activeStartDate)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Selecciona la hora:</label>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => (
                <label key={time} className="block text-gray-700">
                  <input
                    type="radio"
                    name="selectedTime"
                    value={time}
                    checked={selectedTime.getTime() === time.getTime()}
                    onChange={() => setSelectedTime(time)}
                    className="mr-2"
                  />
                  {time.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
  <label className="block text-gray-700 font-medium mb-2">Selecciona los servicios:</label>
  <select
    multiple
    value={selectedServices}
    onChange={(e) => {
      const selectedOptions = Array.from(e.target.selectedOptions).map(
        (option) => option.value
      );
      //console.log('selectedOptions:', selectedOptions);
      setSelectedServices(selectedOptions);
    }}
    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-gray-700 bg-white"
  >
    <option value="Pedicure" className="p-2">
      Pedicure
    </option>
    <option value="Manicure" className="p-2">
      Manicure
    </option>
    <option value="Gelish" className="p-2">
      Soft Gel
    </option>
    <option value="Pintura Tradicional" className="p-2">
      Pintura Tradicional
    </option>
  </select>
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
            <label className="block text-gray-700">Duración total: {Math.floor(totalDuration)} horas y {(totalDuration % 1) * 60} minutos</label>
          </div>

          <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
            Confirmar Cita
          </button>
        </form>
      </div>
    </div>
  );
}