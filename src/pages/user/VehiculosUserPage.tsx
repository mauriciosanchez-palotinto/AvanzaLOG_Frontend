import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';

export function VehiculosUserPage() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<'activos' | 'todos'>('activos');

  const { data: vehiculos, isLoading } = useQuery({
    queryKey: ['vehiculos-user', filtro],
    queryFn: async () => {
      const response = await api.get(`/vehiculos?filtro=${filtro}`);
      return response.data;
    },
    staleTime: 0,
    cacheTime: 0,
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
              VEHÍCULOS DISPONIBLES
            </h1>
          </div>
          <p className="text-[#7B97BC] font-medium tracking-wide pl-6">
            Consulta el estado y kilómetros de cada vehículo
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-10 flex gap-3 flex-wrap">
          <button
            onClick={() => setFiltro('activos')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${
              filtro === 'activos'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-400'
                : 'bg-gray-800/50 text-[#7B97BC] border-gray-700/50 hover:border-emerald-500/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ACTIVOS
          </button>
          <button
            onClick={() => setFiltro('todos')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${
              filtro === 'todos'
                ? 'bg-gradient-to-r from-[#7FA2C8] to-[#5A8AC8] text-white border-[#7FA2C8]'
                : 'bg-gray-800/50 text-[#7B97BC] border-gray-700/50 hover:border-[#7FA2C8]/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            TODOS
          </button>
        </div>

        {/* Grid de vehículos */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#7FA2C8] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#7B97BC] font-semibold tracking-wider">
                  CARGANDO VEHÍCULOS...
                </span>
              </div>
            </div>
          ) : vehiculos && vehiculos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehiculos.map((vehiculo: any) => (
                <div
                  key={vehiculo.id}
                  className="bg-gradient-to-br from-[#5A1E5C]/50 to-[#6A2A6E]/50 border-2 border-[#7B97BC]/30 rounded-2xl p-6 hover:border-[#7FA2C8]/50 transition-all hover:shadow-lg"
                >
                  {/* Encabezado de la tarjeta */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[#7B97BC] text-xs uppercase font-bold">PLACA</p>
                        <p className="text-white font-black text-2xl">{vehiculo.placa}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg font-bold text-xs ${
                        vehiculo.activo
                          ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-900/50 text-red-300 border border-red-500/30'
                      }`}>
                        {vehiculo.activo ? '✓ ACTIVO' : '✕ INACTIVO'}
                      </div>
                    </div>
                  </div>

                  {/* Información del vehículo */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-[#7B97BC]/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[#7B97BC] text-xs uppercase font-bold">MARCA</p>
                        <p className="text-white font-semibold">{vehiculo.marca}</p>
                      </div>
                      <div>
                        <p className="text-[#7B97BC] text-xs uppercase font-bold">MODELO</p>
                        <p className="text-white font-semibold">{vehiculo.modelo}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[#7B97BC] text-xs uppercase font-bold">AÑO</p>
                      <p className="text-white font-semibold">{vehiculo.ano}</p>
                    </div>

                    <div className="bg-[#5A1E5C] rounded-lg p-3">
                      <p className="text-[#7B97BC] text-xs uppercase font-bold mb-1">KILÓMETROS</p>
                      <p className="text-[#7FA2C8] font-black text-xl">{parseFloat(vehiculo.kilometrajeActual).toLocaleString('es-CO')} km</p>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#7B97BC] text-sm">Tipo:</span>
                      <span className="text-white font-semibold">{vehiculo.tipo || 'Camión'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7B97BC] text-sm">Color:</span>
                      <span className="text-white font-semibold">{vehiculo.color || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Botón iniciar viaje */}
                  {vehiculo.activo && (
                    <button
                      onClick={() => navigate('/iniciar-viaje', { state: { vehiculoId: vehiculo.id } })}
                      className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      Iniciar Viaje
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-[#5A1E5C]/40 to-[#6A2A6E]/40 border-2 border-[#7B97BC]/30 rounded-2xl p-12 inline-block">
                <svg className="w-20 h-20 text-[#7B97BC] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <h3 className="text-2xl font-bold text-white mb-3">SIN VEHÍCULOS</h3>
                <p className="text-[#7B97BC]">No hay vehículos disponibles en esta categoría</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
