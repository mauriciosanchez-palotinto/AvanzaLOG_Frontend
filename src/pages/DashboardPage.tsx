import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Navbar } from '../components/Navbar';

export function DashboardPage() {
  const { data: vehiculos, isLoading } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: async () => {
      const response = await api.get('/vehiculos');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#5A1E5C] to-[#1a0d1b]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#7FA2C8] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#7FA2C8] font-semibold tracking-wider">
            CARGANDO DATOS...
          </span>
        </div>
      </div>
    );
  }

  const disponibles = vehiculos?.filter((v: any) => v.estado === 'disponible').length || 0;
  const enUso = vehiculos?.filter((v: any) => v.estado === 'en_uso').length || 0;
  const bloqueados = vehiculos?.filter((v: any) => v.estado === 'bloqueado').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-[#2a1a2b]">
      <Navbar />
      
      <div className="p-6 lg:p-10">
        {/* Encabezado con efecto industrial */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-10 bg-[#7FA2C8] rounded-r"></div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              PANEL DE CONTROL
            </h1>
          </div>
          <p className="text-[#7B97BC] font-medium tracking-wide pl-6">
            Monitoreo en tiempo real de la flota vehicular
          </p>
        </div>

        {/* Tarjetas de resumen con diseño industrial */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Tarjeta Total Vehículos */}
          <div className="bg-gradient-to-br from-[#5A1E5C]/90 to-[#6A2A6E]/90 border-2 border-[#7B97BC]/30 rounded-2xl p-6 shadow-2xl hover:shadow-[#7FA2C8]/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#6A2A6E] p-3 rounded-xl border border-[#7FA2C8]/50">
                <svg className="w-7 h-7 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-5xl font-black text-white">{vehiculos?.length || 0}</span>
            </div>
            <h3 className="text-[#7FA2C8] font-bold text-lg mb-2 uppercase tracking-wider">FLOTA TOTAL</h3>
            <p className="text-gray-300 text-sm font-medium">Vehículos registrados en sistema</p>
          </div>

          {/* Tarjeta Disponibles */}
          <div className="bg-gradient-to-br from-[#1a3d1a] to-[#2a4d2a] border-2 border-emerald-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-emerald-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-900 p-3 rounded-xl border border-emerald-500/50">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-5xl font-black text-emerald-400">{disponibles}</span>
            </div>
            <h3 className="text-emerald-400 font-bold text-lg mb-2 uppercase tracking-wider">OPERATIVOS</h3>
            <p className="text-gray-300 text-sm font-medium">Listos para asignación inmediata</p>
          </div>

          {/* Tarjeta En Uso */}
          <div className="bg-gradient-to-br from-[#4a3a1a] to-[#5a4a2a] border-2 border-amber-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-amber-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-900 p-3 rounded-xl border border-amber-500/50">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-5xl font-black text-amber-400">{enUso}</span>
            </div>
            <h3 className="text-amber-400 font-bold text-lg mb-2 uppercase tracking-wider">EN OPERACIÓN</h3>
            <p className="text-gray-300 text-sm font-medium">Actualmente en misiones activas</p>
          </div>

          {/* Tarjeta Bloqueados */}
          <div className="bg-gradient-to-br from-[#4a1a1a] to-[#5a2a2a] border-2 border-red-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-red-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-900 p-3 rounded-xl border border-red-500/50">
                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <span className="text-5xl font-black text-red-400">{bloqueados}</span>
            </div>
            <h3 className="text-red-400 font-bold text-lg mb-2 uppercase tracking-wider">EN MANTENIMIENTO</h3>
            <p className="text-gray-300 text-sm font-medium">Fuera de servicio temporalmente</p>
          </div>
        </div>

        {/* Tabla de vehículos con estilo industrial */}
        <div className="bg-gradient-to-br from-[#5A1E5C]/40 to-[#6A2A6E]/40 border-2 border-[#7B97BC]/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Encabezado de tabla */}
          <div className="bg-gradient-to-r from-[#5A1E5C] to-[#6A2A6E] px-8 py-6 border-b-2 border-[#7FA2C8]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#7FA2C8] p-2 rounded-lg">
                  <svg className="w-6 h-6 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">REGISTRO DE VEHÍCULOS</h2>
                  <p className="text-[#7B97BC] text-sm font-medium tracking-wide">
                    Estado actual de la flota • Actualización en tiempo real
                  </p>
                </div>
              </div>
              <div className="hidden lg:block">
                <span className="px-4 py-2 bg-[#7FA2C8] text-[#5A1E5C] font-bold rounded-lg">
                  {vehiculos?.length || 0} UNIDADES
                </span>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#5A1E5C]/60 to-[#6A2A6E]/60">
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold text-lg tracking-wider">PLACA</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold text-lg tracking-wider">MARCA/MODELO</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold text-lg tracking-wider">ESTADO</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold text-lg tracking-wider">KILOMETRAJE</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehiculos?.map((v: any, index: number) => (
                  <tr 
                    key={v.id} 
                    className={`
                      border-b border-[#7B97BC]/20 
                      ${index % 2 === 0 ? 'bg-[#5A1E5C]/10' : 'bg-[#6A2A6E]/10'}
                      hover:bg-[#7FA2C8]/10 transition-colors duration-200
                    `}
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#6A2A6E] p-2 rounded-md">
                          <svg className="w-5 h-5 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <span className="font-black text-lg text-white tracking-wider">{v.placa}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div>
                        <span className="font-semibold text-white">{v.marca}</span>
                        <span className="text-[#7FA2C8] mx-2">•</span>
                        <span className="text-gray-300">{v.modelo}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-3 h-3 rounded-full 
                          ${v.estado === 'disponible' ? 'bg-emerald-400 animate-pulse' : ''}
                          ${v.estado === 'en_uso' ? 'bg-amber-400 animate-pulse' : ''}
                          ${v.estado === 'bloqueado' ? 'bg-red-400 animate-pulse' : ''}
                        `}></div>
                        <span className={`
                          px-4 py-2 rounded-lg font-bold text-sm tracking-wider
                          ${v.estado === 'disponible' ? 
                            'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30' : 
                            v.estado === 'en_uso' ? 
                            'bg-amber-900/50 text-amber-300 border border-amber-500/30' : 
                            'bg-red-900/50 text-red-300 border border-red-500/30'
                          }
                        `}>
                          {v.estado === 'disponible' ? 'OPERATIVO' : 
                           v.estado === 'en_uso' ? 'EN MISIÓN' : 
                           'MANTENIMIENTO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#5A1E5C] p-2 rounded-md">
                          <svg className="w-5 h-5 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-2xl font-black text-white">{v.kilometrajeActual}</span>
                          <span className="text-[#7B97BC] font-semibold ml-2">km</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer de tabla */}
          <div className="bg-gradient-to-r from-[#5A1E5C] to-[#6A2A6E] px-8 py-4 border-t-2 border-[#7FA2C8]/30">
            <div className="flex items-center justify-between">
              <div className="text-[#7B97BC] text-sm font-medium tracking-wide">
                Última actualización: {new Date().toLocaleDateString('es-ES')}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Operativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">En misión</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Mantenimiento</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}