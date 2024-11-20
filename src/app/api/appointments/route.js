import { NextResponse } from 'next/server';
import prisma from './prismaClient';

// Valida si un campo existe y es válido
function validateRequestBody(body) {
  const requiredFields = ['date', 'service', 'duration', 'status', 'number', 'name'];
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// GET: Obtiene las citas y horarios ocupados
// GET: Obtiene las citas y horarios ocupados
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  console.log('Received date:', date);

  let startDate, endDate;

  if (date) {
    startDate = new Date(date);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
  } else {
    startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // Un mes antes de la fecha actual
    endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Un mes después de la fecha actual
  }

  console.log('Start date:', startDate);
  console.log('End date:', endDate);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate
        }
      }
    });

    // Generar los horarios ocupados con la duración flotante
    const occupiedTimes = appointments.flatMap(appointment => {
      const startTime = new Date(appointment.date);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + Math.floor(appointment.duration)); // Aquí aseguramos que es float

      const times = [];
      for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 15)) {
        times.push(new Date(time)); // Clonamos `time` para evitar mutaciones
      }

      return times;
    });

    console.log('Appointments:', appointments);
    console.log('Occupied times:', occupiedTimes);

    return NextResponse.json({ appointments, occupiedTimes });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(request) {
  const { date, service, duration, status, number, name } = await request.json();

  try {
    // Asegurarse de que la duración es un número flotante (en minutos)
    const durationAsFloat = parseFloat(duration);

    if (isNaN(durationAsFloat)) {
      return NextResponse.json({ error: 'Duración inválida' }, { status: 400 });
    }

    // Calcular la fecha de inicio y la fecha de fin con la duración flotante (en minutos)
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + durationAsFloat * 60000);

    // Verificar si hay conflictos de citas
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        AND: [
          {
            date: {
              lt: endDate, // Empieza antes de que termine la nueva cita
            },
          },
          {
            date: {
              gt: startDate, // Termina después de que inicie la nueva cita
            },
          },
        ],
      },
    });

    if (conflictingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'Conflicto con una cita existente', conflicts: conflictingAppointments },
        { status: 409 }
      );
    }

    // Crear la cita si no hay conflictos
    const appointment = await prisma.appointment.create({
      data: { date, service, duration: durationAsFloat, status, number, name },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
