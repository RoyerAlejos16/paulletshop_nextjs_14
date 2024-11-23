// pages/api/appointments/status.js

import { NextResponse } from 'next/server';
import prisma from '../prismaClient';
//import next from 'next';
import cors, { corsMiddleware  } from '../../../../../libs/cors';


function setCorsHeaders(response) {
  const cors = corsMiddleware();

  // Configurar encabezados de CORS
  response.headers.set('Access-Control-Allow-Origin', cors.origin);
  response.headers.set('Access-Control-Allow-Methods', cors.methods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', cors.headers.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
}
export async function POST(request) {
  const response = new NextResponse();

  // Configurar CORS
  setCorsHeaders(response);

  const { id, status } = await request.json();
  let variable = status;
  if (status === 1) {
    variable = 'confirmado';
  } else if (status === 0) {
    variable = 'cancelado';
  } else if (status === 2) {
    variable = 'asistida';
  } else if (status === 3) {
    variable = 'no asistido';
  } else if (status === 4) {
    variable = 'reprogramado';
  } else {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  try {
    const updatedAppointment = await prisma.citas.update({
      where: { id },
      data: { status : variable },
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