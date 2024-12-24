import { Suspense } from 'react';
import AppointmentScheduler from './componente';

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AppointmentScheduler />
    </Suspense>
  );
}