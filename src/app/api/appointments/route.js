import { NextResponse } from 'next/server';
import prisma from './prismaClient';
import next from 'next';

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
export async function GET1(request) {
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

  //console.log('Start date:', startDate);
  //console.log('End date:', endDate);

  try {
    const appointments = await prisma.citas.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // Generar los horarios ocupados con la duración flotante
    const occupiedTimes = appointments.flatMap((appointment) => {
      const startTime = new Date(appointment.date);
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + appointment.duration * 60); // Convertir duración a minutos

      const times = [];
      for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 15)) {
        times.push(new Date(time)); // Clonamos `time` para evitar mutaciones
      }

      return times;
    });

    return NextResponse.json({ appointments, occupiedTimes });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
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

  // Convertir las fechas a milisegundos desde el 1 de enero de 1970 y ajustar a GMT-6
  const startDateMillis = BigInt(startDate.getTime()) - BigInt(6 * 60 * 60 * 1000);
  const endDateMillis = BigInt(endDate.getTime()) - BigInt(6 * 60 * 60 * 1000);

  console.log('Start date (milisegundos):', startDateMillis);
  console.log('End date (milisegundos):', endDateMillis);

  try {
    const appointments = await prisma.citas.findMany({
      where: {
        date: {
          gte: startDateMillis,
          lt: endDateMillis,
        },
      },
    });

    // Generar los horarios ocupados con la duración flotante
    const occupiedTimes = appointments.flatMap((appointment) => {
      const startTime = new Date(Number(appointment.date));
      const endTime = new Date(startTime.getTime() + appointment.duration * 60 * 60 * 1000); // Convertir duración a milisegundos

      const times = [];
      for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 15)) {
        times.push(new Date(time)); // Clonamos `time` para evitar mutaciones
      }

      return times;
    });

    // Convertir los horarios ocupados a milisegundos desde el 1 de enero de 1970 y ajustar a GMT-6
    const occupiedTimesMillis = occupiedTimes.map(time => BigInt(time.getTime()) );
    const appointmentsResponse = appointments.map(appointment => ({
      ...appointment,
      date: appointment.date.toString(),
    }));
    const occupiedTimesResponse = occupiedTimesMillis.map(time => time.toString());

    return NextResponse.json({ appointments: appointmentsResponse, occupiedTimes: occupiedTimesResponse });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(request) {
  const { date, service, duration, status, number, name } = await request.json();

  try {
    console.log('Datos recibidos:', { date, service, duration, status, number, name });
    const startDate = new Date(date);
    const startDateMillis = startDate.getTime();
    console.log('Fecha de inicio (milisegundos):', startDateMillis);
     // Asegurarse de que la duración es un número flotante (en minutos)
     const durationAsFloat = parseFloat(duration);

     if (isNaN(durationAsFloat)) {
       return NextResponse.json({ error: 'Duración inválida' }, { status: 400 });
     }
    // Convertir la fecha de milisegundos a GMT-6
    const gmtMinus6Date = new Date(startDateMillis);
    gmtMinus6Date.setHours(gmtMinus6Date.getHours() - 6);
    const gmtMinus6DateISO = gmtMinus6Date.toISOString();
    const serviceString = Array.isArray(service) ? service.join(', ') : service;

    console.log('Fecha en GMT-6 (ISO):', gmtMinus6DateISO);
    // Convertir 'service' en un arreglo si es necesario
    const appointment = await prisma.citas.create({
      data: { date: startDateMillis, service : serviceString, duration: durationAsFloat, status, number, name },
    });
    // Crear la cita si no hay conflictos
    const appointmentResponse = {
      ...appointment,
      date: appointment.date.toString(),
    };

    return NextResponse.json(appointmentResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
