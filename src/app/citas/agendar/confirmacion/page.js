'use client';

import { Suspense } from 'react';
import ConfirmationPage from './componente';

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmationPage />
    </Suspense>
  );
}
