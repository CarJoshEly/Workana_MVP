'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-50 p-4 rounded-full mb-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal al cargar los datos</h2>
      <p className="text-gray-500 mb-6 max-w-md">No pudimos conectar con el servidor. Por favor, intenta recargar la página.</p>
      <button onClick={() => reset()} className="flex items-center px-6 py-2 bg-[#1A9B5E] text-white rounded-lg font-bold hover:bg-[#14804d] transition shadow-md">
        <RotateCcw className="mr-2 w-4 h-4" /> Reintentar
      </button>
    </div>
  );
}