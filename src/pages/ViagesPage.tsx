import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Navbar } from '../components/Navbar';
import { useToastStore } from '../stores/toastStore';

export function ViagesPage() {
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'activos' | 'historial'>('activos');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    usuarioId: '',
    vehiculoId: '',
    kmInicial: '',
    gasolinaInicial: '',
    fotos: [] as File[],
    fotosGasolinaInicial: [] as File[],
  });
  const [finalizarForm, setFinalizarForm] = useState<{ viajeId: number | null; kmFinal: string; gasolinaFinal: string; observaciones: string; fotos: File[]; fotosGasolinaFinal: File[] }>({
    viajeId: null,
    kmFinal: '',
    gasolinaFinal: '',
    observaciones: '',
    fotos: [],
    fotosGasolinaFinal: [],
  });

  const { data: usuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await api.get('/usuarios');
      return response.data;
    },
  });

  const { data: vehiculos } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: async () => {
      const response = await api.get('/vehiculos?filtro=activos');
      return response.data;
    },
  });

  const { data: viajes, refetch } = useQuery({
    queryKey: ['viajes', tab],
    queryFn: async () => {
      const url = tab === 'activos' ? '/viajes/activos' : '/viajes';
      const response = await api.get(url);
      return response.data;
    },
  });

  const iniciarMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Primero iniciar el viaje
      const response = await api.post('/viajes/iniciar', {
        vehiculoId: parseInt(data.vehiculoId),
        kmInicial: parseFloat(data.kmInicial),
        gasolinaInicial: data.gasolinaInicial ? parseFloat(data.gasolinaInicial) : undefined,
      });

      const viajeId = response.data.id;

      // Subir fotos de inicio
      if (data.fotos && data.fotos.length > 0) {
        for (const foto of data.fotos) {
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
      if (data.fotosGasolinaInicial && data.fotosGasolinaInicial.length > 0) {
        for (const foto of data.fotosGasolinaInicial) {
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
      setFormData({ usuarioId: '', vehiculoId: '', kmInicial: '', gasolinaInicial: '', fotos: [], fotosGasolinaInicial: [] });
      setShowForm(false);
      refetch();
      addToast('Viaje iniciado correctamente', 'success');
    },
    onError: () => {
      addToast(' Error al iniciar viaje', 'error');
    },
  });

  const finalizarMutation = useMutation({
    mutationFn: async (data: any) => {
      // Primero finalizar el viaje
      const response = await api.put(`/viajes/${data.viajeId}/finalizar`, {
        kmFinal: parseFloat(data.kmFinal),
        gasolinaFinal: data.gasolinaFinal ? parseFloat(data.gasolinaFinal) : undefined,
        observaciones: data.observaciones,
      });

      // Subir fotos de fin de viaje
      if (data.fotos && data.fotos.length > 0) {
        for (const foto of data.fotos) {
          const formData = new FormData();
          formData.append('file', foto);
          formData.append('tipo', 'fin');
          await api.post(`/viajes/${data.viajeId}/evidencia`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      // Subir fotos de gasolina final
      if (data.fotosGasolinaFinal && data.fotosGasolinaFinal.length > 0) {
        for (const foto of data.fotosGasolinaFinal) {
          const formData = new FormData();
          formData.append('file', foto);
          formData.append('tipo', 'gasolina_final');
          await api.post(`/viajes/${data.viajeId}/evidencia`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      return response;
    },
    onSuccess: (response) => {
      // Si el viaje requiere lavado, mostrar notificación
      if (response.data.debeLavar) {
        addToast(
          `🚗 ¡El vehículo requiere lavado! Ha completado múltiples usos.`,
          'warning',
          5000
        );
      }
      setFinalizarForm({ viajeId: null, kmFinal: '', gasolinaFinal: '', observaciones: '', fotos: [], fotosGasolinaFinal: [] });
      refetch();
      addToast('Viaje finalizado correctamente', 'success');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al finalizar viaje';
      addToast(` ${errorMessage}`, 'error');
      
      // Si el error es por lavado requerido, abrir modal de lavado automáticamente
      if (errorMessage.toLowerCase().includes('lavado')) {
        const viajeId = finalizarForm.viajeId;
        setFinalizarForm({ viajeId: null, kmFinal: '', gasolinaFinal: '', observaciones: '', fotos: [], fotosGasolinaFinal: [] });
        setLavadoForm({ viajeId: viajeId, fotos: [] });
      }
    },
  });

  const marcarLavadoMutation = useMutation({
    mutationFn: async (data: any) => {
      // Primero marcar como lavado
      const response = await api.put(`/viajes/${data.viajeId}/marcar-lavado`);

      // Luego subir fotos si las hay
      if (data.fotos && data.fotos.length > 0) {
        for (const foto of data.fotos) {
          const formData = new FormData();
          formData.append('file', foto);
          formData.append('tipo', 'lavado');
          await api.post(`/viajes/${data.viajeId}/evidencia`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      return response;
    },
    onSuccess: () => {
      setLavadoForm({ viajeId: null, fotos: [] });
      refetch();
      // Refrescar evidencias del viaje que se acaba de lavar
      if (lavadoForm.viajeId) {
        queryClient.invalidateQueries({ queryKey: ['evidencias', lavadoForm.viajeId] });
      }
      addToast(' Lavado marcado correctamente con evidencia', 'success');
    },
    onError: () => {
      addToast('Error al marcar lavado', 'error');
    },
  });

  const handleIniciar = (e: React.FormEvent) => {
    e.preventDefault();
    iniciarMutation.mutate(formData);
  };

  const handleFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Buscar el viaje actual
    const viajeActual = viajes?.find((v: any) => v.id === finalizarForm.viajeId);
    
    // Si el vehículo previo requiere lavado, mostrar alerta
    if (viajeActual?.vehiculo?.debeLavar) {
      addToast('Primero debe lavar el vehículo antes de finalizarlo', 'warning');
      // Mostrar modal de lavado automáticamente
      setLavadoForm({ viajeId: finalizarForm.viajeId, fotos: [] });
      return;
    }
    
    finalizarMutation.mutate(finalizarForm);
  };

  // Estados para modal de evidencias
  const [showEvidencias, setShowEvidencias] = useState<{ viajeId: number; tipo: 'inicio' | 'fin' | 'lavado' | 'gasolina_inicial' | 'gasolina_final' } | null>(null);
  const [lavadoForm, setLavadoForm] = useState<{ viajeId: number | null; fotos: File[] }>({
    viajeId: null,
    fotos: [],
  });
  const { data: evidenciasData } = useQuery({
    queryKey: ['evidencias', showEvidencias?.viajeId],
    queryFn: async () => {
      if (!showEvidencias) return [];
      const response = await api.get(`/viajes/${showEvidencias.viajeId}/evidencias`);
      return response.data;
    },
    enabled: !!showEvidencias,
  });

  const evidenciasFilteradas = evidenciasData?.filter((e: any) => e.tipo === showEvidencias?.tipo) || [];

  // Debug
  React.useEffect(() => {
    if (showEvidencias) {
      console.log('showEvidencias.tipo:', showEvidencias.tipo);
      console.log('evidenciasData:', evidenciasData);
      console.log('evidenciasFilteradas:', evidenciasFilteradas);
    }
  }, [showEvidencias, evidenciasData, evidenciasFilteradas]);

  // Obtener viajes que necesitan lavado
  const viajesParaLavar = viajes?.filter((v: any) => v.debeLavar && !v.lavo) || [];

  // Estadísticas para la parte superior
  const viajesActivosCount = viajes?.filter((v: any) => !v.fechaFin).length || 0;
  const totalViajes = viajes?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-[#2a1a2b]">
      <Navbar />
      
      <div className="p-6 lg:p-10">
        {/* Encabezado con estadísticas */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-10 bg-[#7FA2C8] rounded-r"></div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              GESTIÓN DE VIAJES
            </h1>
          </div>
          <p className="text-[#7B97BC] font-medium tracking-wide pl-6">
            Control y seguimiento de operaciones vehiculares
          </p>
          
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-[#5A1E5C]/80 to-[#6A2A6E]/80 border-2 border-[#7B97BC]/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#7B97BC] font-bold text-lg uppercase tracking-wider">VIAJES ACTIVOS</h3>
                  <p className="text-5xl font-black text-white mt-2">{viajesActivosCount}</p>
                </div>
                <div className="bg-[#7FA2C8]/20 p-4 rounded-xl border border-[#7FA2C8]/50">
                  <svg className="w-8 h-8 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#5A1E5C]/80 to-[#6A2A6E]/80 border-2 border-[#7B97BC]/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#7B97BC] font-bold text-lg uppercase tracking-wider">TOTAL VIAJES</h3>
                  <p className="text-5xl font-black text-white mt-2">{totalViajes}</p>
                </div>
                <div className="bg-[#7FA2C8]/20 p-4 rounded-xl border border-[#7FA2C8]/50">
                  <svg className="w-8 h-8 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#5A1E5C]/80 to-[#6A2A6E]/80 border-2 border-[#7B97BC]/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#7B97BC] font-bold text-lg uppercase tracking-wider">PENDIENTE LAVADO</h3>
                  <p className="text-5xl font-black text-white mt-2">{viajesParaLavar.length}</p>
                </div>
                <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-500/50">
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de lavado pendiente */}
        {viajesParaLavar.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-amber-900/40 to-amber-800/40 border-2 border-amber-500/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-amber-900 p-3 rounded-xl border border-amber-500/50">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-400 mb-1">¡ATENCIÓN: LAVADO REQUERIDO!</h3>
                <p className="text-amber-300 font-medium">
                  <span className="text-amber-400 font-bold">{viajesParaLavar.length} vehículo(s)</span> han completado 4 viajes y requieren lavado antes de continuar operaciones.
                </p>
              </div>
              <div className="bg-amber-900/50 px-4 py-2 rounded-lg border border-amber-500/30">
                <span className="text-amber-300 font-bold text-lg">{viajesParaLavar.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Controles superiores */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          {/* Pestañas */}
          <div className="flex bg-gradient-to-r from-[#5A1E5C] to-[#6A2A6E] p-2 rounded-2xl border-2 border-[#7B97BC]/30">
            <button
              onClick={() => { setTab('activos'); setShowForm(false); }}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                tab === 'activos' 
                  ? 'bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] text-[#5A1E5C] shadow-lg transform -translate-y-0.5' 
                  : 'text-[#7B97BC] hover:text-white hover:bg-[#5A1E5C]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                VIAJES ACTIVOS
              </div>
            </button>
            <button
              onClick={() => { setTab('historial'); setShowForm(false); }}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                tab === 'historial' 
                  ? 'bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] text-[#5A1E5C] shadow-lg transform -translate-y-0.5' 
                  : 'text-[#7B97BC] hover:text-white hover:bg-[#5A1E5C]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                HISTORIAL
              </div>
            </button>
          </div>

          {/* Botón de iniciar viaje */}
          {tab === 'activos' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-xl transform hover:scale-105 active:scale-95 ${
                showForm 
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-2 border-red-500/50 text-red-400' 
                  : 'bg-gradient-to-r from-[#7FA2C8] to-[#5A8AC8] text-white border-2 border-[#7FA2C8]'
              }`}
            >
              {showForm ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  CANCELAR
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  INICIAR VIAJE
                </>
              )}
            </button>
          )}
        </div>

        {/* Formulario de inicio de viaje */}
        {showForm && tab === 'activos' && (
          <div className="mb-10 bg-gradient-to-br from-[#5A1E5C]/40 to-[#6A2A6E]/40 border-2 border-[#7B97BC]/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-3 rounded-xl">
                <svg className="w-8 h-8 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                REGISTRAR NUEVO VIAJE
              </h2>
            </div>
            
            <form onSubmit={handleIniciar} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usuario */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      OPERADOR
                    </div>
                  </label>
                  <select
                    value={formData.usuarioId}
                    onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                  >
                    <option value="" className="bg-gray-900">SELECCIONAR OPERADOR</option>
                    {usuarios?.map((u: any) => (
                      <option key={u.id} value={u.id} className="bg-gray-900">{u.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Vehículo */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      VEHÍCULO
                    </div>
                  </label>
                  <select
                    value={formData.vehiculoId}
                    onChange={(e) => {
                      const selectedVehicle = vehiculos?.find((v: any) => v.id === parseInt(e.target.value));
                      setFormData({ 
                        ...formData, 
                        vehiculoId: e.target.value,
                        gasolinaInicial: selectedVehicle?.gasolinaInicial?.toString() || '100'
                      });
                    }}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                  >
                    <option value="" className="bg-gray-900">SELECCIONAR VEHÍCULO</option>
                    {vehiculos?.map((v: any) => (
                      <option key={v.id} value={v.id} className="bg-gray-900">
                        {v.placa} - {v.marca} {v.modelo} ({v.estado})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Km Inicial */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      KILOMETRAJE INICIAL
                    </div>
                  </label>
                  <input
                    type="number"
                    placeholder="EJ: 12345.67"
                    value={formData.kmInicial}
                    onChange={(e) => setFormData({ ...formData, kmInicial: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                    step="0.01"
                  />
                </div>

                {/* Gasolina Inicial */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      COMBUSTIBLE INICIAL (L)
                    </div>
                  </label>
                  <input
                    type="number"
                    placeholder="EJ: 45.5"
                    value={formData.gasolinaInicial}
                    onChange={(e) => setFormData({ ...formData, gasolinaInicial: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Sección de fotos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fotos Gasolina Inicial */}
                <div className="bg-gray-900/30 border-2 border-[#7B97BC]/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg">FOTOS DE COMBUSTIBLE</h3>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setFormData({ ...formData, fotosGasolinaInicial: [...formData.fotosGasolinaInicial, ...newFiles] });
                    }}
                    className="w-full bg-gray-800/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl"
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
                          <div key={idx} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-300 text-sm truncate">{foto.name}</span>
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
                <div className="bg-gray-900/30 border-2 border-[#7B97BC]/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg">EVIDENCIA FOTOGRÁFICA</h3>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setFormData({ ...formData, fotos: [...formData.fotos, ...newFiles] });
                    }}
                    className="w-full bg-gray-800/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl"
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
                          <div key={idx} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-300 text-sm truncate">{foto.name}</span>
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

              {/* Botón de submit */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={iniciarMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#7FA2C8] to-[#5A8AC8] hover:from-[#6A92B8] hover:to-[#4A7AA8] text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {iniciarMutation.isPending ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      PROCESANDO...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      INICIAR MISIÓN
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-2xl border-2 border-gray-700 transition-all duration-300"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de viajes */}
        <div className="bg-gradient-to-br from-[#5A1E5C]/40 to-[#6A2A6E]/40 border-2 border-[#7B97BC]/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Encabezado de tabla */}
          <div className="bg-gradient-to-r from-[#5A1E5C] to-[#6A2A6E] px-8 py-6 border-b-2 border-[#7FA2C8]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#7FA2C8] p-3 rounded-xl">
                  <svg className="w-7 h-7 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {tab === 'activos' ? 'VIAJES EN CURSO' : 'HISTORIAL DE VIAJES'}
                  </h2>
                  <p className="text-[#7B97BC] text-sm font-medium tracking-wide">
                    {tab === 'activos' ? 'Operaciones activas en tiempo real' : 'Registro completo de todas las misiones'}
                  </p>
                </div>
              </div>
              <div className="hidden lg:block">
                <span className="px-6 py-3 bg-[#7FA2C8] text-[#5A1E5C] font-bold rounded-xl">
                  {viajes?.length || 0} {tab === 'activos' ? 'ACTIVOS' : 'REGISTROS'}
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
                      <span className="text-[#7FA2C8] font-bold tracking-wider">OPERADOR</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold tracking-wider">VEHÍCULO</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold tracking-wider">INICIO</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  {tab === 'historial' && (
                    <th className="px-8 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[#7FA2C8] font-bold tracking-wider">FINAL</span>
                        <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                      </div>
                    </th>
                  )}
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold tracking-wider">COMBUSTIBLE</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold tracking-wider">EVIDENCIA</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  {tab === 'historial' && (
                    <th className="px-8 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[#7FA2C8] font-bold tracking-wider">LAVADO</span>
                        <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                      </div>
                    </th>
                  )}
                  {tab === 'activos' && (
                    <th className="px-8 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[#7FA2C8] font-bold tracking-wider">ACCIÓN</span>
                        <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {viajes?.map((viaje: any, index: number) => (
                  <tr 
                    key={viaje.id} 
                    className={`
                      border-b border-[#7B97BC]/20 
                      ${index % 2 === 0 ? 'bg-[#5A1E5C]/10' : 'bg-[#6A2A6E]/10'}
                      hover:bg-[#7FA2C8]/10 transition-colors duration-200
                    `}
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#6A2A6E] p-2 rounded-lg">
                          <svg className="w-5 h-5 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-white">{viaje.usuario.nombre}</div>
                          <div className="text-[#7B97BC] text-sm">{viaje.usuario.cargo || 'Operador'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#5A1E5C] p-2 rounded-lg">
                          <svg className="w-5 h-5 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-white">{viaje.vehiculo.placa}</div>
                          <div className="text-[#7B97BC] text-sm">{viaje.vehiculo.marca} {viaje.vehiculo.modelo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="space-y-1">
                        <div className="text-white font-medium">{new Date(viaje.fechaInicio).toLocaleDateString()}</div>
                        <div className="text-[#7B97BC] text-sm">{new Date(viaje.fechaInicio).toLocaleTimeString()}</div>
                        <div className="text-[#7FA2C8] font-bold text-sm">
                          {viaje.kmInicial} km • {viaje.gasolinaInicial} L
                        </div>
                      </div>
                    </td>
                    {tab === 'historial' && (
                      <td className="px-8 py-4">
                        {viaje.fechaFin ? (
                          <div className="space-y-1">
                            <div className="text-white font-medium">{new Date(viaje.fechaFin).toLocaleDateString()}</div>
                            <div className="text-[#7B97BC] text-sm">{new Date(viaje.fechaFin).toLocaleTimeString()}</div>
                            <div className="text-[#7FA2C8] font-bold text-sm">
                              {viaje.kmFinal} km • {viaje.gasolinaFinal} L
                            </div>
                          </div>
                        ) : (
                          <span className="text-red-400 font-bold">EN CURSO</span>
                        )}
                      </td>
                    )}
                    <td className="px-8 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setShowEvidencias({ viajeId: viaje.id, tipo: 'gasolina_inicial' })}
                          className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            INICIAL
                          </div>
                        </button>
                        {tab === 'historial' && viaje.gasolinaFinal && (
                          <button
                            onClick={() => setShowEvidencias({ viajeId: viaje.id, tipo: 'gasolina_final' })}
                            className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              FINAL
                            </div>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setShowEvidencias({ viajeId: viaje.id, tipo: 'inicio' })}
                          className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] hover:from-[#6A92B8] hover:to-[#6A87AC] text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                            INICIO
                          </div>
                        </button>
                        {tab === 'historial' && viaje.fechaFin && (
                          <button
                            onClick={() => setShowEvidencias({ viajeId: viaje.id, tipo: 'fin' })}
                            className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              </svg>
                              FINAL
                            </div>
                          </button>
                        )}
                        {tab === 'historial' && viaje.lavo && (
                          <button
                            onClick={() => setShowEvidencias({ viajeId: viaje.id, tipo: 'lavado' })}
                            className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              </svg>
                              LAVADO
                            </div>
                          </button>
                        )}
                      </div>
                    </td>
                    {tab === 'historial' && (
                      <td className="px-8 py-4">
                        {viaje.debeLavar ? (
                          <div className="flex flex-col gap-2">
                            {viaje.lavo ? (
                              <button
                                onClick={() => setShowEvidencias({ viajeId: viaje.id, tipo: 'lavado' })}
                                className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105"
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  VER FOTOS LAVADO
                                </div>
                              </button>
                            ) : (
                              <button
                                onClick={() => setLavadoForm({ viajeId: viaje.id, fotos: [] })}
                                disabled={marcarLavadoMutation.isPending}
                                className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                              >
                                {marcarLavadoMutation.isPending ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    PROCESANDO
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    MARCAR LAVADO
                                  </div>
                                )}
                              </button>
                            )}
                            <div className={`text-xs text-center font-bold ${viaje.lavo ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {viaje.lavo ? 'COMPLETO' : 'PENDIENTE'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 font-bold">—</span>
                        )}
                      </td>
                    )}
                    {tab === 'activos' && (
                      <td className="px-8 py-4">
                        <div className="flex flex-col gap-2">
                          {viaje.debeLavar && !viaje.lavo ? (
                            <button
                              onClick={() => setLavadoForm({ viajeId: viaje.id, fotos: [] })}
                              disabled={marcarLavadoMutation.isPending}
                              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                            >
                              {marcarLavadoMutation.isPending ? (
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  PROCESANDO
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                  </svg>
                                  MARCAR LAVADO
                                </div>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => setFinalizarForm({ viajeId: viaje.id, kmFinal: '', gasolinaFinal: viaje.vehiculo?.gasolinaFinal?.toString() || '50', observaciones: '', fotos: [], fotosGasolinaFinal: [] })}
                              className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                FINALIZAR VIAJE
                              </div>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer de tabla */}
          <div className="bg-gradient-to-r from-[#5A1E5C] to-[#6A2A6E] px-8 py-4 border-t-2 border-[#7FA2C8]/30">
            <div className="flex items-center justify-between">
              <div className="text-[#7B97BC] text-sm font-medium tracking-wide">
                {tab === 'activos' ? 'VIAJES ACTIVOS EN TIEMPO REAL' : 'REGISTRO HISTÓRICO COMPLETO'}
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">En uso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para finalizar viaje */}
      {finalizarForm.viajeId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-[#5A1E5C] to-[#6A2A6E] border-2 border-[#7FA2C8]/50 rounded-2xl p-8 shadow-2xl max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                FINALIZAR MISIÓN
              </h2>
            </div>
            
            {/* Advertencia si el vehículo requiere lavado */}
            {viajes?.find((v: any) => v.id === finalizarForm.viajeId)?.vehiculo?.debeLavar && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-900/50 to-red-800/50 border-2 border-red-500/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-red-900 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-400">¡ATENCIÓN: LAVADO REQUERIDO!</h3>
                    <p className="text-red-300 text-sm">
                      Este vehículo ha completado 3 viajes. Debe marcar lavado y subir evidencia antes de finalizar.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleFinalizar} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    KILOMETRAJE FINAL
                  </label>
                  <input
                    type="number"
                    placeholder="EJ: 12567.89"
                    value={finalizarForm.kmFinal}
                    onChange={(e) => setFinalizarForm({ ...finalizarForm, kmFinal: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                    step="0.01"
                  />
                </div>
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    COMBUSTIBLE FINAL (L)
                  </label>
                  <input
                    type="number"
                    placeholder="EJ: 25.5"
                    value={finalizarForm.gasolinaFinal}
                    onChange={(e) => setFinalizarForm({ ...finalizarForm, gasolinaFinal: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="relative group">
                <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                  OBSERVACIONES
                </label>
                <textarea
                  placeholder="Detalles adicionales del viaje..."
                  value={finalizarForm.observaciones}
                  onChange={(e) => setFinalizarForm({ ...finalizarForm, observaciones: e.target.value })}
                  className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fotos Gasolina Final */}
                <div className="bg-gray-900/30 border-2 border-[#7B97BC]/20 rounded-xl p-4">
                  <label className="block text-[#7FA2C8] font-bold mb-3 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      COMBUSTIBLE FINAL
                    </div>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setFinalizarForm({ ...finalizarForm, fotosGasolinaFinal: [...finalizarForm.fotosGasolinaFinal, ...newFiles] });
                    }}
                    className="w-full bg-gray-800/50 border-2 border-[#7B97BC]/30 text-white px-4 py-2 rounded-lg text-sm"
                  />
                  {finalizarForm.fotosGasolinaFinal.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 text-sm font-bold">
                          ✓ {finalizarForm.fotosGasolinaFinal.length} CAPTURA(S)
                        </span>
                        <button
                          type="button"
                          onClick={() => setFinalizarForm({ ...finalizarForm, fotosGasolinaFinal: [] })}
                          className="text-red-400 hover:text-red-300 text-xs font-bold"
                        >
                          LIMPIAR
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Fotos de Evidencia */}
                <div className="bg-gray-900/30 border-2 border-[#7B97BC]/20 rounded-xl p-4">
                  <label className="block text-[#7FA2C8] font-bold mb-3 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      EVIDENCIA FINAL
                    </div>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setFinalizarForm({ ...finalizarForm, fotos: [...finalizarForm.fotos, ...newFiles] });
                    }}
                    className="w-full bg-gray-800/50 border-2 border-[#7B97BC]/30 text-white px-4 py-2 rounded-lg text-sm"
                  />
                  {finalizarForm.fotos.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[#7FA2C8] text-sm font-bold">
                          📸 {finalizarForm.fotos.length} FOTO(S)
                        </span>
                        <button
                          type="button"
                          onClick={() => setFinalizarForm({ ...finalizarForm, fotos: [] })}
                          className="text-red-400 hover:text-red-300 text-xs font-bold"
                        >
                          LIMPIAR
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={finalizarMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 px-6 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {finalizarMutation.isPending ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      FINALIZANDO...
                    </div>
                  ) : 'CONFIRMAR FINALIZACIÓN'}
                </button>
                <button
                  type="button"
                  onClick={() => setFinalizarForm({ viajeId: null, kmFinal: '', gasolinaFinal: '', observaciones: '', fotos: [], fotosGasolinaFinal: [] })}
                  className="px-8 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl border-2 border-gray-700 transition-all duration-300"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver evidencias */}
      {showEvidencias && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-[#5A1E5C] to-[#6A2A6E] border-2 border-[#7FA2C8]/50 rounded-2xl p-8 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-3 rounded-xl">
                  <svg className="w-8 h-8 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  EVIDENCIA FOTOGRÁFICA - {
                    showEvidencias.tipo === 'inicio' ? 'INICIO DE VIAJE' :
                    showEvidencias.tipo === 'fin' ? 'FIN DE VIAJE' :
                    showEvidencias.tipo === 'lavado' ? 'LAVADO COMPLETADO' :
                    showEvidencias.tipo === 'gasolina_inicial' ? 'COMBUSTIBLE INICIAL' :
                    'COMBUSTIBLE FINAL'
                  }
                </h2>
              </div>
              <button
                onClick={() => setShowEvidencias(null)}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {evidenciasFilteradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {evidenciasFilteradas.map((evidencia: any) => (
                  <div key={evidencia.id} className="bg-gray-900/50 rounded-2xl overflow-hidden border-2 border-[#7B97BC]/30">
                    <img
                      src={`http://localhost:3000${evidencia.urlArchivo}`}
                      alt={evidencia.nombreArchivo}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-white font-bold truncate">{evidencia.nombreArchivo}</p>
                      <p className="text-[#7B97BC] text-sm mt-1">
                        {new Date(evidencia.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-900/50 p-8 rounded-2xl border-2 border-[#7B97BC]/30 inline-block">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400 text-lg font-bold">NO HAY EVIDENCIAS DISPONIBLES</p>
                  <p className="text-gray-500 text-sm mt-2">No se han subido fotos para esta categoría</p>
                </div>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowEvidencias(null)}
                className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300"
              >
                CERRAR VISOR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para marcar lavado */}
      {lavadoForm.viajeId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-[#5A1E5C] to-[#6A2A6E] border-2 border-[#7FA2C8]/50 rounded-2xl p-8 shadow-2xl max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                REGISTRAR LAVADO
              </h2>
            </div>
            
            <div className="mb-6 bg-amber-900/30 border-2 border-amber-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-amber-300 font-bold">
                  ⚠️ LAVADO OBLIGATORIO
                </p>
              </div>
              <p className="text-amber-200 text-sm leading-relaxed">
                El vehículo ha sido usado 4 veces y <strong>REQUIERE LAVADO</strong> antes de poder finalizar este viaje.
              </p>
              <p className="text-amber-300 text-sm mt-2 font-semibold">
                📸 Por favor, adjunte evidencia fotográfica del lavado y luego podrá finalizar el viaje.
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-[#7FA2C8] font-bold mb-3 tracking-wider text-sm uppercase">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  EVIDENCIA FOTOGRÁFICA DEL LAVADO *OBLIGATORIO
                </div>
              </label>
              <div className="relative">
                <input
                  key={`lavado-input-${lavadoForm.viajeId}`}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    if (newFiles.length > 0) {
                      setLavadoForm({ ...lavadoForm, fotos: [...lavadoForm.fotos, ...newFiles] });
                    }
                  }}
                  className="w-full bg-gray-900/50 border-2 border-dashed border-[#7FA2C8]/50 text-white px-4 py-4 rounded-xl cursor-pointer hover:border-[#7FA2C8] transition-colors file:bg-amber-600 file:text-white file:px-4 file:py-2 file:rounded file:border-0 file:cursor-pointer"
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">Haz clic para seleccionar imágenes o arrastra y suelta archivos aquí</p>
              
              {lavadoForm.fotos.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-emerald-400 font-bold">
                      ✓ {lavadoForm.fotos.length} FOTO(S) CAPTURADA(S)
                    </span>
                    <button
                      type="button"
                      onClick={() => setLavadoForm({ ...lavadoForm, fotos: [] })}
                      className="text-red-400 hover:text-red-300 text-sm font-bold"
                    >
                      LIMPIAR TODO
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {lavadoForm.fotos.map((foto, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-300 text-sm truncate">{foto.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLavadoForm({
                              ...lavadoForm,
                              fotos: lavadoForm.fotos.filter((_, i) => i !== idx)
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
            
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setLavadoForm({ viajeId: null, fotos: [] })}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl border-2 border-gray-700 transition-all duration-300"
                disabled={marcarLavadoMutation.isPending}
              >
                CANCELAR
              </button>
              <button
                onClick={() => marcarLavadoMutation.mutate(lavadoForm)}
                disabled={marcarLavadoMutation.isPending || lavadoForm.fotos.length === 0}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-4 px-6 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title={lavadoForm.fotos.length === 0 ? "Debe adjuntar al menos una foto antes de confirmar" : ""}
              >
                {marcarLavadoMutation.isPending ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    GUARDANDO FOTOS...
                  </div>
                ) : lavadoForm.fotos.length === 0 ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 0H8m4 0h4" />
                    </svg>
                    ADJUNTA FOTOS PARA CONTINUAR
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    GUARDAR LAVADO ({lavadoForm.fotos.length} FOTO{lavadoForm.fotos.length !== 1 ? 'S' : ''})
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}