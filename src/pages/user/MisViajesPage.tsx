import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { useToastStore } from '../../stores/toastStore';
import { api } from '../../services/api';

export function MisViajesPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();

  const [filtro, setFiltro] = useState<'activos' | 'completados' | 'todos'>('activos');
  const [viajeFinalizando, setViajeFinalizando] = useState<number | null>(null);
  const [formFinalizacion, setFormFinalizacion] = useState({
    kmFinal: '',
    gasolinaFinal: '',
    observaciones: '',
    fotos: [] as File[],
    fotosGasolinaFinal: [] as File[],
  });

  const { data: viajes, isLoading } = useQuery({
    queryKey: ['mis-viajes', filtro],
    queryFn: async () => {
      if (filtro === 'activos') {
        const response = await api.get('/viajes/mis-viajes/activos');
        return response.data;
      } else if (filtro === 'completados') {
        const response = await api.get('/viajes/mis-viajes');
        return response.data.filter((v: any) => v.fechaFin);
      } else {
        const response = await api.get('/viajes/mis-viajes');
        return response.data;
      }
    },
    staleTime: 0,
    cacheTime: 0,
  });

  // Mutation para finalizar viaje
  const finalizarViajeMutation = useMutation({
    mutationFn: async (viajeId: number) => {
      // Primero finalizar el viaje
      const response = await api.put(`/viajes/${viajeId}/finalizar`, {
        kmFinal: parseFloat(formFinalizacion.kmFinal),
        gasolinaFinal: formFinalizacion.gasolinaFinal ? parseFloat(formFinalizacion.gasolinaFinal) : undefined,
        observaciones: formFinalizacion.observaciones || undefined,
      });

      // Subir fotos de fin de viaje
      if (formFinalizacion.fotos && formFinalizacion.fotos.length > 0) {
        for (const foto of formFinalizacion.fotos) {
          const fotoFormData = new FormData();
          fotoFormData.append('file', foto);
          fotoFormData.append('tipo', 'fin');
          await api.post(`/viajes/${viajeId}/evidencia`, fotoFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      // Subir fotos de gasolina final
      if (formFinalizacion.fotosGasolinaFinal && formFinalizacion.fotosGasolinaFinal.length > 0) {
        for (const foto of formFinalizacion.fotosGasolinaFinal) {
          const fotoFormData = new FormData();
          fotoFormData.append('file', foto);
          fotoFormData.append('tipo', 'gasolina_final');
          await api.post(`/viajes/${viajeId}/evidencia`, fotoFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      return response;
    },
    onSuccess: () => {
      addToast('¡Viaje finalizado correctamente!', 'success');
      queryClient.invalidateQueries({ queryKey: ['mis-viajes'] });
      setViajeFinalizando(null);
      setFormFinalizacion({ kmFinal: '', gasolinaFinal: '', observaciones: '', fotos: [], fotosGasolinaFinal: [] });
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || 'Error al finalizar el viaje', 'error');
    },
  });

  const handleFinalizarViaje = (e: React.FormEvent, viajeId: number) => {
    e.preventDefault();
    if (!formFinalizacion.kmFinal) {
      addToast('Debes ingresar los km finales', 'error');
      return;
    }
    finalizarViajeMutation.mutate(viajeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-[#2a1a2b]">
      <Navbar />
      
      <div className="p-6 lg:p-10">
        {/* Encabezado */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-10 bg-[#7FA2C8] rounded-r"></div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              MIS VIAJES
            </h1>
          </div>
          <p className="text-[#7B97BC] font-medium tracking-wide pl-6">
            Historial completo de tus viajes
          </p>
        </div>

        {/* Botón para iniciar viaje */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/iniciar-viaje')}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Iniciar Nuevo Viaje
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-10 flex gap-3 flex-wrap">
          <button
            onClick={() => setFiltro('activos')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${
              filtro === 'activos'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white border-amber-400'
                : 'bg-gray-800/50 text-[#7B97BC] border-gray-700/50 hover:border-amber-500/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            ACTIVOS
          </button>
          <button
            onClick={() => setFiltro('completados')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${
              filtro === 'completados'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-400'
                : 'bg-gray-800/50 text-[#7B97BC] border-gray-700/50 hover:border-emerald-500/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            COMPLETADOS
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

        {/* Lista de viajes */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#7FA2C8] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#7B97BC] font-semibold tracking-wider">
                  CARGANDO VIAJES...
                </span>
              </div>
            </div>
          ) : viajes && viajes.length > 0 ? (
            viajes.map((viaje: any) => (
              <div key={viaje.id}>
                {/* Tarjeta del viaje */}
                <div className="bg-gradient-to-br from-[#5A1E5C]/50 to-[#6A2A6E]/50 border-2 border-[#7B97BC]/30 rounded-2xl p-6 hover:border-[#7FA2C8]/50 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Información básica */}
                    <div>
                      <p className="text-[#7B97BC] text-xs uppercase font-bold">VIAJE</p>
                      <p className="text-white font-bold text-lg">#{viaje.id}</p>
                    </div>

                    {/* Vehículo */}
                    <div>
                      <p className="text-[#7B97BC] text-xs uppercase font-bold">VEHÍCULO</p>
                      <p className="text-white font-bold">{viaje.vehiculo?.placa || 'N/A'}</p>
                    </div>

                    {/* Fechas */}
                    <div>
                      <p className="text-[#7B97BC] text-xs uppercase font-bold">FECHAS</p>
                      <p className="text-white font-bold text-sm">
                        {new Date(viaje.fechaInicio).toLocaleDateString()}
                        {viaje.fechaFin && ` - ${new Date(viaje.fechaFin).toLocaleDateString()}`}
                      </p>
                    </div>

                    {/* Kilometraje */}
                    <div>
                      <p className="text-[#7B97BC] text-xs uppercase font-bold">RECORRIDO</p>
                      <p className="text-white font-bold">
                        {viaje.kmInicial ? `${viaje.kmInicial} km` : 'Pendiente'}
                      </p>
                    </div>
                  </div>

                  {/* Estado y acciones */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-lg font-bold text-xs ${
                      !viaje.fechaFin
                        ? 'bg-amber-900/50 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {!viaje.fechaFin ? 'EN CURSO' : 'COMPLETADO'}
                    </div>

                    {!viaje.fechaFin && (
                      <button
                        onClick={() => setViajeFinalizando(viajeFinalizando === viaje.id ? null : viaje.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105"
                      >
                        {viajeFinalizando === viaje.id ? 'Cancelar' : 'Finalizar'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Formulario de finalización */}
                {viajeFinalizando === viaje.id && !viaje.fechaFin && (
                  <div className="bg-[#5A1E5C]/80 border-2 border-red-500/50 rounded-2xl p-6 mt-4">
                    <h3 className="text-white font-bold text-lg mb-4">Finalizar Viaje #{viaje.id}</h3>
                    <form onSubmit={(e) => handleFinalizarViaje(e, viaje.id)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* KM Final */}
                        <div>
                          <label className="text-[#7FA2C8] text-sm font-semibold block mb-2">KM Final</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formFinalizacion.kmFinal}
                            onChange={(e) => setFormFinalizacion({ ...formFinalizacion, kmFinal: e.target.value })}
                            className="w-full bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-3 py-2 rounded-lg focus:border-red-500 outline-none"
                            placeholder="Ej: 25050.75"
                            required
                          />
                        </div>

                        {/* Gasolina Final */}
                        <div>
                          <label className="text-[#7FA2C8] text-sm font-semibold block mb-2">Gasolina Final (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={formFinalizacion.gasolinaFinal}
                            onChange={(e) => setFormFinalizacion({ ...formFinalizacion, gasolinaFinal: e.target.value })}
                            className="w-full bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-3 py-2 rounded-lg focus:border-red-500 outline-none"
                            placeholder="Ej: 60"
                          />
                        </div>
                      </div>

                      {/* Observaciones */}
                      <div>
                        <label className="text-[#7FA2C8] text-sm font-semibold block mb-2">Observaciones (Opcional)</label>
                        <textarea
                          value={formFinalizacion.observaciones}
                          onChange={(e) => setFormFinalizacion({ ...formFinalizacion, observaciones: e.target.value })}
                          className="w-full bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-3 py-2 rounded-lg focus:border-red-500 outline-none"
                          placeholder="Ej: Viaje completado sin incidentes"
                          rows={3}
                        />
                      </div>

                      {/* Sección de fotos */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border-t border-[#7B97BC]/30 pt-4">
                        {/* Fotos de Fin */}
                        <div className="bg-[#5A1E5C]/60 border-2 border-[#7B97BC]/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="bg-gradient-to-r from-red-600 to-red-500 p-1.5 rounded">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="text-white font-bold text-sm uppercase">Fotos Fin KM (kilometraje)</h4>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              const newFiles = Array.from(e.target.files || []);
                              setFormFinalizacion({ ...formFinalizacion, fotos: [...formFinalizacion.fotos, ...newFiles] });
                            }}
                            className="w-full bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-3 py-2 rounded text-xs cursor-pointer"
                          />
                          {formFinalizacion.fotos.length > 0 && (
                            <div className="mt-2">
                              <span className="text-red-400 font-bold text-xs">{formFinalizacion.fotos.length} archivo(s)</span>
                              <div className="space-y-1 max-h-20 overflow-y-auto mt-1">
                                {formFinalizacion.fotos.map((foto, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-[#6A2A6E]/30 p-2 rounded text-xs">
                                    <span className="text-[#7B97BC] truncate">{foto.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => setFormFinalizacion({ ...formFinalizacion, fotos: formFinalizacion.fotos.filter((_, i) => i !== idx) })}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Fotos de Gasolina Final */}
                        <div className="bg-[#5A1E5C]/60 border-2 border-[#7B97BC]/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-1.5 rounded">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="text-white font-bold text-sm uppercase">Fotos Combustible</h4>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              const newFiles = Array.from(e.target.files || []);
                              setFormFinalizacion({ ...formFinalizacion, fotosGasolinaFinal: [...formFinalizacion.fotosGasolinaFinal, ...newFiles] });
                            }}
                            className="w-full bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-3 py-2 rounded text-xs cursor-pointer"
                          />
                          {formFinalizacion.fotosGasolinaFinal.length > 0 && (
                            <div className="mt-2">
                              <span className="text-emerald-400 font-bold text-xs">{formFinalizacion.fotosGasolinaFinal.length} archivo(s)</span>
                              <div className="space-y-1 max-h-20 overflow-y-auto mt-1">
                                {formFinalizacion.fotosGasolinaFinal.map((foto, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-[#6A2A6E]/30 p-2 rounded text-xs">
                                    <span className="text-[#7B97BC] truncate">{foto.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => setFormFinalizacion({ ...formFinalizacion, fotosGasolinaFinal: formFinalizacion.fotosGasolinaFinal.filter((_, i) => i !== idx) })}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={finalizarViajeMutation.isPending}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
                        >
                          {finalizarViajeMutation.isPending ? 'Finalizando...' : 'Confirmar Finalización'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-[#5A1E5C]/40 to-[#6A2A6E]/40 border-2 border-[#7B97BC]/30 rounded-2xl p-12 inline-block">
                <svg className="w-20 h-20 text-[#7B97BC] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-2xl font-bold text-white mb-3">SIN VIAJES</h3>
                <p className="text-[#7B97BC]">No tienes viajes en esta categoría</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
