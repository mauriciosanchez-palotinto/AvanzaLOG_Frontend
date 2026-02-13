import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Navbar } from '../../components/Navbar';
import { useAuthStore } from '../../stores/authStore';

export function DashboardUserPage() {
  const { user } = useAuthStore();

  const { data: viajesActivos } = useQuery({
    queryKey: ['viajes', 'activos'],
    queryFn: async () => {
      const response = await api.get('/viajes/activos');
      return response.data;
    },
  });

  const { data: estadisticas } = useQuery({
    queryKey: ['usuario', 'estadisticas'],
    queryFn: async () => {
      const response = await api.get('/usuarios/mi-perfil');
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-[#2a1a2b]">
      <Navbar />
      
      <div className="p-6 lg:p-10">
        {/* Encabezado */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-10 bg-[#7FA2C8] rounded-r"></div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              PANEL DE USUARIO
            </h1>
          </div>
          <p className="text-[#7B97BC] font-medium tracking-wide pl-6">
            Bienvenido, {user?.nombre}
          </p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Viajes Activos */}
          <div className="bg-gradient-to-br from-amber-900/80 to-amber-800/80 border-2 border-amber-500/30 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-amber-400 font-bold text-lg uppercase tracking-wider">VIAJES ACTIVOS</h3>
                <p className="text-5xl font-black text-white mt-2">{viajesActivos?.length || 0}</p>
              </div>
              <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-500/50">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Viajes */}
          <div className="bg-gradient-to-br from-[#5A1E5C]/80 to-[#6A2A6E]/80 border-2 border-[#7B97BC]/30 rounded-2xl p-6 shadow-xl hover:shadow-[#7FA2C8]/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#7B97BC] font-bold text-lg uppercase tracking-wider">TOTAL VIAJES</h3>
                <p className="text-5xl font-black text-white mt-2">0</p>
              </div>
              <div className="bg-[#7FA2C8]/20 p-4 rounded-xl border border-[#7FA2C8]/50">
                <svg className="w-8 h-8 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Kilometraje */}
          <div className="bg-gradient-to-br from-emerald-900/80 to-emerald-800/80 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl hover:shadow-emerald-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-emerald-400 font-bold text-lg uppercase tracking-wider">KM TOTAL</h3>
                <p className="text-5xl font-black text-white mt-2">0</p>
              </div>
              <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/50">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Viajes Activos */}
        <div className="bg-gradient-to-br from-[#5A1E5C]/40 to-[#6A2A6E]/40 border-2 border-[#7B97BC]/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-3 rounded-xl">
              <svg className="w-8 h-8 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              MIS VIAJES ACTIVOS
            </h2>
          </div>

          {viajesActivos && viajesActivos.length > 0 ? (
            <div className="space-y-4">
              {viajesActivos.map((viaje: any) => (
                <div key={viaje.id} className="bg-gray-900/50 border border-[#7B97BC]/20 rounded-xl p-4 hover:border-[#7FA2C8]/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-lg">Viaje #{viaje.id}</p>
                      <p className="text-[#7B97BC] text-sm">Iniciado: {new Date(viaje.fechaInicio).toLocaleString()}</p>
                    </div>
                    <button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-2 px-4 rounded-lg transition-all">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#7B97BC] py-8">No hay viajes activos en este momento</p>
          )}
        </div>
      </div>
    </div>
  );
}
