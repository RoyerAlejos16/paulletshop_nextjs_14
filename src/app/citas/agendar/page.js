"use client";
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [name, setName] = useState('');
  const [services, setServices] = useState([]);
  const [phone, setPhone] = useState('');
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [firstPeriodTimes, setFirstPeriodTimes] = useState([]);
  const [secondPeriodTimes, setSecondPeriodTimes] = useState([]);

  const serviceOptions = [
    { value: 'service1', label: 'Pedicure', duration: 1.25 },
    { value: 'service2', label: 'Manicure', duration: 1.25 },
    { value: 'service3', label: 'Sofgt Gel', duration: 1.25 },
    { value: 'service4', label: 'Pintura Tradicional', duration: 1.25 },
  ];

  const endOfNovember = new Date(new Date().getFullYear(), 10, 30); // 30th November
  const startOfDecember = new Date(new Date().getFullYear(), 11, 1); // 1st December

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('/api/appointments');
        console.log('Response:', response.data);
        const { appointments, occupiedTimes } = response.data;
        setAppointments(appointments);
        setOccupiedTimes(occupiedTimes.map(time => new Date(time))); // Convertir a objetos Date
        console.log("ocupados", occupiedTimes);
        console.log("appointments", appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
  
    fetchAppointments();
    setFirstPeriodTimes([
      new Date(new Date().setHours(15, 0, 0, 0)), // 3:00 PM
      new Date(new Date().setHours(15, 15, 0, 0)), // 3:15 PM
      new Date(new Date().setHours(15, 30, 0, 0)), // 3:30 PM
      new Date(new Date().setHours(15, 45, 0, 0)), // 3:45 PM
      new Date(new Date().setHours(16, 0, 0, 0)),  // 4:00 PM
      new Date(new Date().setHours(16, 15, 0, 0)), // 4:15 PM
      new Date(new Date().setHours(16, 30, 0, 0)), // 4:30 PM
      new Date(new Date().setHours(16, 45, 0, 0)), // 4:45 PM
      new Date(new Date().setHours(17, 0, 0, 0)),  // 5:00 PM
      new Date(new Date().setHours(17, 15, 0, 0)), // 5:15 PM
      new Date(new Date().setHours(17, 30, 0, 0)), // 5:30 PM
      new Date(new Date().setHours(17, 45, 0, 0)), // 5:45 PM
      new Date(new Date().setHours(18, 0, 0, 0)),  // 6:00 PM
    ]);

    // Definir horarios para el segundo período
    setSecondPeriodTimes([
      new Date(new Date().setHours(11, 0, 0, 0)),  // 11:00 AM
      new Date(new Date().setHours(11, 15, 0, 0)), // 11:15 AM
      new Date(new Date().setHours(11, 30, 0, 0)), // 11:30 AM
      new Date(new Date().setHours(11, 45, 0, 0)), // 11:45 AM
      new Date(new Date().setHours(12, 0, 0, 0)),  // 12:00 PM
      new Date(new Date().setHours(12, 15, 0, 0)), // 12:15 PM
      new Date(new Date().setHours(12, 30, 0, 0)), // 12:30 PM
      new Date(new Date().setHours(12, 45, 0, 0)), // 12:45 PM
      new Date(new Date().setHours(13, 0, 0, 0)),  // 1:00 PM
      new Date(new Date().setHours(13, 15, 0, 0)), // 1:15 PM
      new Date(new Date().setHours(13, 30, 0, 0)), // 1:30 PM
      new Date(new Date().setHours(13, 45, 0, 0)), // 1:45 PM
      new Date(new Date().setHours(14, 0, 0, 0)),  // 2:00 PM
      new Date(new Date().setHours(14, 15, 0, 0)), // 2:15 PM
      new Date(new Date().setHours(14, 30, 0, 0)), // 2:30 PM
      new Date(new Date().setHours(14, 45, 0, 0)), // 2:45 PM
      new Date(new Date().setHours(15, 0, 0, 0)),  // 3:00 PM
      new Date(new Date().setHours(15, 15, 0, 0)), // 3:15 PM
      new Date(new Date().setHours(15, 30, 0, 0)), // 3:30 PM
      new Date(new Date().setHours(15, 45, 0, 0)), // 3:45 PM
      new Date(new Date().setHours(16, 0, 0, 0)),  // 4:00 PM
      new Date(new Date().setHours(16, 15, 0, 0)), // 4:15 PM
      new Date(new Date().setHours(16, 30, 0, 0)), // 4:30 PM
      new Date(new Date().setHours(16, 45, 0, 0)), // 4:45 PM
      new Date(new Date().setHours(17, 0, 0, 0)),  // 5:00 PM
      new Date(new Date().setHours(17, 15, 0, 0)), // 5:15 PM
      new Date(new Date().setHours(17, 30, 0, 0)), // 5:30 PM
      new Date(new Date().setHours(17, 45, 0, 0)), // 5:45 PM
      new Date(new Date().setHours(18, 0, 0, 0)),  // 6:00 PM
    ]);
  }, []);

  const isWithinFirstPeriod = (date) => {
    if (!date) return false;
    const day = date.getDay();
    return date <= endOfNovember && (day === 2 || day === 3 || day === 4); // Tuesday, Wednesday, Thursday
  };

  const isWithinSecondPeriod = (date) => {
    if (!date) return false;
    return date >= startOfDecember; // All dates in December
  };

  const handleServiceChange = (selectedOptions) => {
    setServices(selectedOptions);
    const total = selectedOptions.reduce((acc, service) => acc + service.duration, 0);
    setTotalDuration(total);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const totalDuration = services.reduce((acc, service) => acc + service.duration, 0);
    const localDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
    const appointment = {
      date: localDate.toISOString(),
      service: services.map(service => service.value).join(', '),
      duration: totalDuration,
      status: 'solicitado',
      number: phone,
      name
    };
    try {
      await axios.post('/api/appointments', appointment);
      toast.success('Cita confirmada');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al confirmar la cita');
    }
  };

  const generateTimesForDate = (date, hours) => {
    return hours.map(hour => {
      const newDate = new Date(date);
      newDate.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
      return newDate;
    });
  };
  const getAvailableTimes = () => {
    // Convertir horas ocupadas a objetos Date
    const occupiedTimesLocal = occupiedTimes.map(time => {
      const date = new Date(time);
      date.setHours(date.getHours() + 6); // Ajustar +6 horas
      return date;
  });
  
    console.log("Ocupados (Date):", occupiedTimesLocal);

    // Generar horas del primer periodo (ya en local)
    const firstPeriodHours = [15, 15.25, 15.5, 15.75, 16, 16.25, 16.5, 16.75, 17, 17.25, 17.5, 17.75, 18];
    const firstPeriodTimes = generateTimesForDate(selectedDate, firstPeriodHours);
    console.log("firstPeriodTimes (Date):", firstPeriodTimes);

    // Filtrar horarios disponibles
    const availableTimes = firstPeriodTimes.filter((time) => {
        const isOccupied = occupiedTimesLocal.some(occupied => occupied.getTime() === time.getTime());
        console.log(`Comparando: ${time} con ocupados ${isOccupied}`);
        return !isOccupied;
    });

    console.log("availableTimes (filtered):", availableTimes);
    return availableTimes;
};


  const getMinTime = () => {
    if (isWithinFirstPeriod(selectedDate)) {
      return firstPeriodTimes[0];
    } else if (isWithinSecondPeriod(selectedDate)) {
      return secondPeriodTimes[0];
    }
    return new Date(new Date().setHours(0, 0, 0, 0));
  };

  const getMaxTime = () => {
    if (isWithinFirstPeriod(selectedDate)) {
      return firstPeriodTimes[firstPeriodTimes.length - 1];
    } else if (isWithinSecondPeriod(selectedDate)) {
      return secondPeriodTimes[secondPeriodTimes.length - 1];
    }
    return new Date(new Date().setHours(23, 59, 59, 999));
  };

  const getInitialTime = () => {
    return selectedDate;
  };

  const getTileContent = ({ date, view }) => {
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Agenda tu cita</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Selecciona la fecha:</label>
            <Calendar
              onChange={(date) => setSelectedDate(new Date(date))}
              value={selectedDate}
              tileDisabled={({ date }) => !isWithinFirstPeriod(date) && !isWithinSecondPeriod(date)}
              tileContent={getTileContent}
              className="w-full p-2 border rounded"
              onActiveStartDateChange={({ activeStartDate }) => {
                console.log('Active start date:', activeStartDate);
                axios.get(`/api/appointments?date=${activeStartDate.toISOString()}`)
                  .then(response => {
                    setOccupiedTimes(response.data.occupiedTimes.map(time => new Date(time))); // Convertir a objetos Date
                    setAppointments(response.data.appointments);
                    console.log('Occupied times for active start date:', response.data.occupiedTimes);
                  })
                  .catch(error => {
                    console.error('Error fetching appointments:', error);
                  });
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Selecciona la hora:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Hora"
              dateFormat="h:mm aa"
              className="w-full p-2 border rounded"
              includeTimes={getAvailableTimes()}
              minTime={getMinTime()}
              maxTime={getMaxTime()}
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
      <ToastContainer />
    </div>
  );
};

export default CalendarPage; 