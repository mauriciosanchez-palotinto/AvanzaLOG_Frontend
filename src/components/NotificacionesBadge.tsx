import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

export function NotificacionesBadge() {
  const { user } = useAuthStore();
  const [showPanel, setShowPanel] = useState(false);

  const { data: notificaciones = [], refetch } = useQuery({
    queryKey: ['notificaciones', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await api.get(`/viajes/notificaciones/${user.id}`);
      return response.data;
    },
    refetchInterval: 10000, // Refetch cada 10 segundos
  });

  const marcarLeidaMutation = useMutation({
    mutationFn: async (notificacionId: number) => {
      return await api.put(`/viajes/notificacion/${notificacionId}/leer`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const noLeidas = notificaciones.filter((n: any) => !n.leida).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {noLeidas}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-bold text-lg">Notificaciones</h3>
          </div>
          {notificaciones.length > 0 ? (
            <div className="divide-y">
              {notificaciones.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-4 ${notif.leida ? 'bg-gray-50' : 'bg-blue-50'} border-l-4 ${
                    notif.tipo === 'lavado_pendiente' ? 'border-orange-500' : 'border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">
                        {notif.tipo === 'lavado_pendiente' ? '🚗 Lavado Pendiente' : notif.tipo}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{notif.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.leida && (
                      <button
                        onClick={() => marcarLeidaMutation.mutate(notif.id)}
                        disabled={marcarLeidaMutation.isPending}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        ✓ Marcar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No hay notificaciones
            </div>
          )}
        </div>
      )}
    </div>
  );
}
