import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../../stores/toastStore';
import { api } from '../../services/api';

export function IniciarViajeUserPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    vehiculoId: '',
    kmInicial: '',
    gasolinaInicial: '',
    fotos: [] as File[],
    fotosGasolinaInicial: [] as File[],
  });
  const [showEvidencias, setShowEvidencias] = useState(false);

  // Query para obtener vehículos activos
  const { data: vehiculos, isLoading: vehiculosLoading } = useQuery({
    queryKey: ['vehiculos', 'activos'],
    queryFn: async () => {
      const response = await api.get('/vehiculos?filtro=activos');
      return response.data;
    },
  });

  // Obtener el vehículo seleccionado
  const vehiculoSeleccionado = vehiculos?.find((v: any) => v.id === parseInt(formData.vehiculoId));

  // Query para obtener evidencias del vehículo
  const { data: evidencias } = useQuery({
    queryKey: ['vehiculo-evidencias', formData.vehiculoId],
    queryFn: async () => {
      if (!formData.vehiculoId) return [];
      const response = await api.get(`/vehiculos/${formData.vehiculoId}/evidencias`);
      return response.data;
    },
    enabled: !!formData.vehiculoId,
  });

  // Mutation para iniciar viaje
  const iniciarViajeMutation = useMutation({
    mutationFn: async () => {
      // Primero iniciar el viaje
      const response = await api.post('/viajes/iniciar', {
        vehiculoId: parseInt(formData.vehiculoId),
        kmInicial: parseFloat(formData.kmInicial),
        gasolinaInicial: formData.gasolinaInicial ? parseFloat(formData.gasolinaInicial) : undefined,
      });

      const viajeId = response.data.id;

      // Subir fotos de inicio
      if (formData.fotos && formData.fotos.length > 0) {
        for (const foto of formData.fotos) {
          const fotoFormData = new FormData();
          fotoFormData.append('file', foto);
          fotoFormData.append('tipo', 'inicio');
          await api.post(`/viajes/${viajeId}/evidencia`, fotoFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      // Subir fotos de gasolina inicial
      if (formData.fotosGasolinaInicial && formData.fotosGasolinaInicial.length > 0) {
        for (const foto of formData.fotosGasolinaInicial) {
          const fotoFormData = new FormData();
          fotoFormData.append('file', foto);
          fotoFormData.append('tipo', 'gasolina_inicial');
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
      addToast('¡Viaje iniciado correctamente!', 'success');
      queryClient.invalidateQueries({ queryKey: ['mis-viajes'] });
      queryClient.invalidateQueries({ queryKey: ['viajes', 'activos'] });
      setTimeout(() => navigate('/mis-viajes'), 1500);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || 'Error al iniciar el viaje', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehiculoId || !formData.kmInicial) {
      addToast('Por favor completa todos los campos', 'error');
      return;
    }

    // Validar que el KM inicial coincida con el KM actual del vehículo
    const kmActual = parseFloat(vehiculoSeleccionado?.kilometrajeActual || '0');
    const kmIngresado = parseFloat(formData.kmInicial);

    if (Math.abs(kmActual - kmIngresado) > 0.1) {
      addToast(
        `❌ El KM inicial debe ser igual al KM actual del vehículo (${kmActual.toLocaleString('es-CO')} km)`,
        'error'
      );
      return;
    }

    iniciarViajeMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5A1E5C] to-[#3D1441] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/mis-viajes')}
            className="flex items-center gap-2 text-[#7FA2C8] hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>

          <h1 className="text-4xl font-black text-white mb-2">Iniciar Viaje</h1>
          <p className="text-[#7FA2C8] text-lg">Completa el formulario para comenzar tu viaje</p>
        </div>

        {/* Formulario */}
        <div className="bg-[#6A2A6E]/80 backdrop-blur-sm border-2 border-[#7FA2C8] rounded-xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar Vehículo */}
            <div>
              <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider block mb-3">
                Selecciona un Vehículo
              </label>
              <select
                value={formData.vehiculoId}
                onChange={(e) => setFormData({ ...formData, vehiculoId: e.target.value })}
                disabled={vehiculosLoading}
                className="w-full bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-lg focus:border-[#7FA2C8] outline-none transition-colors disabled:opacity-50"
                required
              >
                <option value="">
                  {vehiculosLoading ? 'Cargando vehículos...' : 'Selecciona un vehículo'}
                </option>
                {vehiculos?.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} - {v.marca} {v.modelo}
                  </option>
                ))}
              </select>
            </div>

            {/* Información del vehículo seleccionado */}
            {vehiculoSeleccionado && (
              <div className="bg-[#5A1E5C]/60 border-2 border-[#7FA2C8]/40 rounded-lg p-6 space-y-4">
                <h3 className="text-[#7FA2C8] font-bold text-lg uppercase tracking-wider">Datos del Vehículo</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#7FA2C8]/60 text-xs uppercase tracking-wider">Placa</p>
                    <p className="text-white font-bold text-lg">{vehiculoSeleccionado.placa}</p>
                  </div>
                  <div>
                    <p className="text-[#7FA2C8]/60 text-xs uppercase tracking-wider">Marca / Modelo</p>
                    <p className="text-white font-bold text-lg">{vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}</p>
                  </div>
                  <div>
                    <p className="text-[#7FA2C8]/60 text-xs uppercase tracking-wider">Km Actual</p>
                    <p className="text-white font-bold text-lg">{parseFloat(vehiculoSeleccionado.kilometrajeActual).toLocaleString('es-CO')} km</p>
                  </div>
                  <div>
                    <p className="text-[#7FA2C8]/60 text-xs uppercase tracking-wider">Gasolina Actual</p>
                    <p className="text-white font-bold text-lg">{vehiculoSeleccionado.gasolinaInicial || 0}%</p>
                  </div>
                </div>

                {/* Botón para ver evidencias */}
                {evidencias && evidencias.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowEvidencias(!showEvidencias)}
                    className="w-full mt-4 bg-[#7FA2C8]/20 border-2 border-[#7FA2C8]/40 hover:border-[#7FA2C8] text-[#7FA2C8] font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {showEvidencias ? 'Ocultar Evidencias' : `Ver Evidencias (${evidencias.length})`}
                  </button>
                )}
              </div>
            )}

            {/* Galería de evidencias */}
            {showEvidencias && evidencias && evidencias.length > 0 && (
              <div className="bg-[#5A1E5C]/60 border-2 border-[#7FA2C8]/40 rounded-lg p-6">
                <h3 className="text-[#7FA2C8] font-bold text-lg uppercase tracking-wider mb-4">Evidencias del Vehículo</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {evidencias.map((foto: any, idx: number) => (
                    <div key={idx} className="relative group overflow-hidden rounded-lg">
                      <img
                        src={foto.url}
                        alt={`Evidencia ${idx + 1}`}
                        className="w-full h-32 object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                        <a
                          href={foto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 bg-[#7FA2C8] p-2 rounded-full transition-all duration-300"
                        >
                          <svg className="w-5 h-5 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KM Inicial */}
            <div>
              <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider block mb-3">
                Kilómetros Iniciales
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.kmInicial}
                onChange={(e) => setFormData({ ...formData, kmInicial: e.target.value })}
                className={`w-full bg-[#5A1E5C] border-2 text-white px-4 py-3 rounded-lg focus:outline-none transition-colors ${
                  vehiculoSeleccionado && formData.kmInicial && Math.abs(parseFloat(vehiculoSeleccionado.kilometrajeActual) - parseFloat(formData.kmInicial)) > 0.1
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-[#7B97BC]/30 focus:border-[#7FA2C8]'
                }`}
                placeholder="Ej: 25000.50"
                required
              />
              <p className="text-[#7FA2C8]/60 text-xs mt-2">Ingresa el km del odómetro del vehículo</p>
              
              {/* Validación de KM */}
              {vehiculoSeleccionado && formData.kmInicial && Math.abs(parseFloat(vehiculoSeleccionado.kilometrajeActual) - parseFloat(formData.kmInicial)) > 0.1 && (
                <div className="mt-3 bg-red-900/30 border-2 border-red-500/50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-red-400 font-bold text-sm">KM no válido</p>
                      <p className="text-red-300/80 text-xs">El km debe ser igual a {parseFloat(vehiculoSeleccionado.kilometrajeActual).toLocaleString('es-CO')} km</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gasolina Inicial */}
            <div>
              <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider block mb-3">
                Gasolina Inicial (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.gasolinaInicial}
                onChange={(e) => setFormData({ ...formData, gasolinaInicial: e.target.value })}
                className="w-full bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-lg focus:border-[#7FA2C8] outline-none transition-colors"
                placeholder="Ej: 85"
              />
              <p className="text-[#7FA2C8]/60 text-xs mt-2">Opcional - Nivel de combustible (0-100%)</p>
            </div>

            {/* Sección de fotos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fotos Gasolina Inicial */}
              <div className="bg-[#5A1E5C]/60 border-2 border-[#7B97BC]/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg uppercase tracking-wider">Fotos de Combustible</h3>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setFormData({ ...formData, fotosGasolinaInicial: [...formData.fotosGasolinaInicial, ...newFiles] });
                  }}
                  className="w-full bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-lg cursor-pointer"
                />
                {formData.fotosGasolinaInicial.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-emerald-400 font-bold">
                        ✓ {formData.fotosGasolinaInicial.length} CAPTURA(S)
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, fotosGasolinaInicial: [] })}
                        className="text-red-400 hover:text-red-300 text-sm font-bold"
                      >
                        LIMPIAR
                      </button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {formData.fotosGasolinaInicial.map((foto, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#6A2A6E]/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[#7B97BC] text-sm truncate">{foto.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                fotosGasolinaInicial: formData.fotosGasolinaInicial.filter((_, i) => i !== idx)
                              });
                            }}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fotos de Evidencia */}
              <div className="bg-[#5A1E5C]/60 border-2 border-[#7B97BC]/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg uppercase tracking-wider">Evidencia Fotográfica</h3>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setFormData({ ...formData, fotos: [...formData.fotos, ...newFiles] });
                  }}
                  className="w-full bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-lg cursor-pointer"
                />
                {formData.fotos.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#7FA2C8] font-bold">
                        📸 {formData.fotos.length} FOTO(S)
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, fotos: [] })}
                        className="text-red-400 hover:text-red-300 text-sm font-bold"
                      >
                        LIMPIAR
                      </button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {formData.fotos.map((foto, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#6A2A6E]/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[#7B97BC] text-sm truncate">{foto.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, fotos: formData.fotos.filter((_, i) => i !== idx) });
                            }}
                            className="text-red-400 hover:text-red-300 font-bold"
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

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={
                  iniciarViajeMutation.isPending || 
                  vehiculosLoading ||
                  (vehiculoSeleccionado && formData.kmInicial && Math.abs(parseFloat(vehiculoSeleccionado.kilometrajeActual) - parseFloat(formData.kmInicial)) > 0.1)
                }
                className="flex-1 bg-[#7FA2C8] hover:bg-[#6B8FB0] disabled:bg-gray-500 text-[#5A1E5C] font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                {iniciarViajeMutation.isPending ? 'Iniciando...' : 'Iniciar Viaje'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/mis-viajes')}
                className="flex-1 bg-[#5A1E5C] hover:bg-[#6A2A6E] border-2 border-[#7FA2C8] text-[#7FA2C8] font-bold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-[#7B97BC]/30">
            <div className="bg-[#5A1E5C]/50 border-l-4 border-[#7FA2C8] px-4 py-3 rounded">
              <p className="text-[#7FA2C8] text-sm">
                <strong>💡 Consejo:</strong> Verifica el odómetro y el nivel de combustible del vehículo antes de iniciar el viaje para registros precisos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
