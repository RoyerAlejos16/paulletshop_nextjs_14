"use client"; // Asegúrate de que este archivo sea un componente del cliente
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-calendar/dist/Calendar.css'; // Asegúrate de importar los estilos
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { set } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import '../../globals.css';
import { setHours, setMinutes, addHours } from 'date-fns';



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
    { value: 'Pedicure', label: 'Pedicure' },
    { value: 'Manicure', label: 'Manicure' },
    { value: 'Gelish', label: 'Sofgt Gel' },
    { value: 'Pintura Tradicional', label: 'Pintura Tradicional' },

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
    const durationperService = 1.25; // Duración predeterminada por servicio
    setTotalDuration(selectedServices.length * durationperService);
  }, [selectedServices]);
  // Generar horarios disponibles

  
  // Manejar la selección de servicios
  const handleServiceChange = (selectedOptions) => {
    setSelectedServices(selectedOptions);
  };
  
  const generateAvailableTimes = (opcion) => {
    const slots = [];
    const startTime = new Date(selectedDate.setHours(15, 0, 0, 0)); // Comienza a las 3:00 PM en hora de México
    const endTime = new Date(selectedDate.setHours(18, 0, 0, 0)); // Termina a las 6:00 PM en hora de México
    let cantidadocupados = 0;
    console.log('Horarios ocupados (UTC):', occupiedTimes);
  
    while (startTime < endTime) {
      // Convertir el tiempo de inicio a UTC en formato numérico
      const startTimeUTC = startTime.getTime() - (0 * 60 * 60 * 1000); // Restar 6 horas para convertir de GMT-6 a UTC
      const endTimeUTC = startTimeUTC + (15 * 60 * 1000); // Intervalo de 15 minutos
  
      console.log('Comparando startTimeUTC:', new Date(startTimeUTC).toISOString(), 'con endTimeUTC:', new Date(endTimeUTC).toISOString());
  
      // Verificar si algún horario ocupado cae dentro del intervalo de tiempo generado
      const isOccupied = occupiedTimes.some(occupied => {
        console.log('Comparando con occupied:', new Date(occupied).toISOString());
        return occupied >= startTimeUTC && occupied < endTimeUTC;
      });
  
      if (!isOccupied) {
        cantidadocupados = cantidadocupados + 1;
        // Convertir el tiempo de UTC a GMT-6 al regresarlo
        const startTimeGMTMinus6 = new Date(startTimeUTC + (0 * 60 * 60 * 1000));
        slots.push(startTimeGMTMinus6);
      }
      //Periodo de tiempo de 1.25 horas
      startTime.setMinutes(startTime.getMinutes() + 75); // Intervalos de 1.25 horas (75 minutos)
    }
  
    console.log('Cantidad de ocupados', cantidadocupados);
    if (opcion === 1) {
      return slots;
    }else{
      return cantidadocupados;
    }
  };
  
  // Manejar la selección de servicios
  const isTimeAvailable = (startTime, duration, occupiedTimes) => {
    const startUTC = startTime.getTime();
    const durationMillis = duration * 60 * 60 * 1000; // Convierte duración a milisegundos
    const endUTC = startUTC + durationMillis;
  
    // Permitir citas que terminen después del horario de cierre (6:00 PM)
    const endOfDay = new Date(startTime);
    endOfDay.setHours(18, 0, 0, 0); // 6:00 PM hora local
  
    if (endUTC > endOfDay.getTime()) {
      return true; // Permitir citas que excedan las 6:00 PM
    }
  
    // Verificar que ningún intervalo ocupado interfiera con la cita
    for (let time = startUTC; time < endUTC; time += 15 * 60 * 1000) {
      if (occupiedTimes.includes(time)) {
        return false; // Si algún intervalo está ocupado, no permitir
      }
    }
  
    return true; // Todos los intervalos están disponibles
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const durationPerService = 1.25; // Duración por servicio (en horas)
  const totalDurationHours = selectedServices.length * durationPerService;

  if (!isTimeAvailable(selectedTime, totalDurationHours, occupiedTimes)) {
    toast.error("No hay disponibilidad para la duración total seleccionada.");
    return;
  }
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
  
    // Función para determinar la clase CSS basada en el tiempo libre
    const tileClassName1 = () => {
        let disponibilidad = generateAvailableTimes(1);
        
        if (disponibilidad >= 4) {
          console.log('full');
          return 'full'; // Mucho tiempo libre
        } else if (disponibilidad >= 5) {
          console.log('almost-full');
          return 'almost-full '; // Tiempo libre moderado
        } else {
          console.log('available');
          return 'available'; // Poco tiempo libre
        }
      
      return null;
    };

    const tileClassName = ({ date , view= 'month' }) => {
      if (view === 'month') {
        const month = date.getMonth();
        const dateString = date.toISOString().split('T')[0];
        const freeMinutes = freeTime[dateString] || 0;
        const totalSlots = 12; // Total de intervalos de 15 minutos entre 3 PM y 6 PM
        const availableSlots = totalSlots - (freeMinutes / 15);
        const percentageFree = (availableSlots / totalSlots) * 100;
        console.log('Porcentaje de tiempo libre:', percentageFree);
        if (month === 10) { // Mes de noviembre (0 = enero, 10 = noviembre)
          if (percentageFree >= 100) {
            return 'bg-green-50'; // Mucho tiempo libre
          } else if (percentageFree >= 60) {
            return 'bg-yellow-500'; // Tiempo libre moderado
          } else {
            return 'bg-red-500'; // Poco tiempo libre
          }
        }
      }
      return null;
    };
    const freeTime = {
      '2023-11-01': 180, // 3 horas libres
      '2023-11-02': 90,  // 1.5 horas libres
      '2023-11-03': 30,  // 0.5 horas libres
      '2023-11-04': 0,   // No hay tiempo libre
    };
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <ToastContainer position="top-right" autoClose={3000} /> {/* Configuración del Toast */}

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
              dateFormat="Pp"
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
              minTime={addHours(setHours(setMinutes(new Date(), 0), 15), 6)} // 3:00 PM UTC
              maxTime={addHours(setHours(setMinutes(new Date(), 0), 18), 6)} // 6:00 PM UTC
              includeTimes={generateAvailableTimes(1)}
              onKeyDown={(e) => e.preventDefault()} // Evita que el usuario escriba manualmente

            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Selecciona los servicios:</label>
            <Select
              isMulti
              options={serviceOptions}
              onChange={handleServiceChange}
              className="w-full"
              onKeyDown={(e) => e.preventDefault()} // Evita que el usuario escriba manualmente

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