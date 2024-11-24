import { NextResponse } from 'next/server';
import prisma from './prismaClient';
//import next from 'next';
import cors, { corsMiddleware  } from '../../../../libs/cors';
// Valida si un campo existe y es válido


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
      status: {
        notIn: ['cancelado', 'no asistido','reprogramado'],
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

// Middleware para ejecutar CORS antes de cada handler
function setCorsHeaders(response) {
  const cors = corsMiddleware();

  // Configurar encabezados de CORS
  response.headers.set('Access-Control-Allow-Origin', cors.origin);
  response.headers.set('Access-Control-Allow-Methods', cors.methods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', cors.headers.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
}

// Valida si un campo existe y es válido
function validateRequestBody(body) {
  const requiredFields = ['date', 'service', 'duration', 'status', 'number', 'name'];
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

export async function GET(request) {

  const response = new NextResponse();

  // Configurar CORS
  setCorsHeaders(response);
  
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const vista = searchParams.get('vista');
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
  let datos;
    if(vista == null){
      datos = ['cancelado', 'no asistido','reprogramado','solicitado']
    }else
    {
      datos = ['cancelado1']
    }

  try {
    const appointments = await prisma.citas.findMany({
      where: {
        date: {
          gte: startDateMillis,
          lt: endDateMillis,
        },
        status: {
          notIn: datos,
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

    // Manejo de CORS
    const response = new NextResponse();

    // Configurar CORS
    setCorsHeaders(response);
  
  const { date, service, duration, status, number, name } = await request.json();
    // Eliminar espacios del número
    const sanitizedNumber = number.replace(/\s+/g, '').replace('+', '');
    console.log('number:', sanitizedNumber);
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
      data: { date: startDateMillis, service : serviceString, duration: durationAsFloat, status, number : sanitizedNumber, name },
    });
    // Crear la cita si no hay conflictos
    const appointmentResponse = {
      ...appointment,
      date: appointment.date.toString(),
    };
    let mensaje = `Buen día ${appointment.name}, tu cita (${appointment.service} el ${new Date(Number(appointment.date)).toLocaleString('es-ES', {
      timeZone: 'America/Mexico_City',
      hour12: true,
    })}) ha sido creada. En brevedad me pondré en contacto contigo o te llegará un mensaje de confirmación. Gracias. 📅.`;
    const notificationData = {
      numero: [sanitizedNumber],
      mensaje: mensaje,
    };
    await fetch('http://localhost:4002/mensaje/enviar_mod', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
    return NextResponse.json(appointmentResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function OPTIONS(request) {
  const response = new NextResponse();
  setCorsHeaders(response);
  return response;
}


export async function PATCH(request) {
  const response = new NextResponse();
  setCorsHeaders(response);

  const { id, status } = await request.json();
  console.log('Received appointment status:', { id, status });
  return NextResponse.json("ok", { status: 200 });

  try {
    const updatedAppointment = await prisma.citas.update({
      where: { id },
      data: { status },
    });

    const updatedAppointmentResponse = {
      ...updatedAppointment,
      date: updatedAppointment.date.toString(),
    };

    return NextResponse.json(updatedAppointmentResponse, { status: 200 });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}