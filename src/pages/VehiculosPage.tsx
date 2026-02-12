import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Navbar } from '../components/Navbar';

export function VehiculosPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<'activos' | 'inactivos' | 'todos'>('activos');
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    color: '',
  });

  const vehiculosQuery = useQuery(
    ['vehiculos', filtro],
    async () => {
      const response = await api.get(`/vehiculos?filtro=${filtro}`);
      return response.data;
    },
    { staleTime: 0, cacheTime: 0 }
  );
  
  const vehiculos = vehiculosQuery.data ?? [];
  const isLoading = vehiculosQuery.isLoading;

  // Estadísticas (calculadas sobre todos los vehículos para mantener consistencia)
  const allVehiculosQuery = useQuery(
    ['vehiculos-all'],
    async () => {
      const response = await api.get('/vehiculos?filtro=todos');
      return response.data;
    }
  );

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingId) {
        return await api.put(`/vehiculos/${editingId}`, data);
      }
      const response = await api.post('/vehiculos', data);
      return response.data;
    },
    onSuccess: () => {
      setFormData({ placa: '', marca: '', modelo: '', ano: new Date().getFullYear(), color: '' });
      setEditingId(null);
      setShowForm(false);
      queryClient.invalidateQueries(['vehiculos']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/vehiculos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['vehiculos']);
    },
  });

  const toggleActivoMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.put(`/vehiculos/${id}/toggle-activo`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['vehiculos']);
    },
  });

  const handleEdit = (vehiculo: any) => {
    setEditingId(vehiculo.id);
    setFormData({
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      ano: vehiculo.ano,
      color: vehiculo.color || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ placa: '', marca: '', modelo: '', ano: new Date().getFullYear(), color: '' });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-[#2a1a2b] flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#7FA2C8] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#7FA2C8] font-semibold tracking-wider">
            CARGANDO FLOTA...
          </span>
        </div>
      </div>
    );
  }

  const allVehiculos = allVehiculosQuery.data || [];
  const vehiculosActivos = allVehiculos.filter((v: any) => v.activo).length || 0;
  const vehiculosDisponibles = allVehiculos.filter((v: any) => v.estado === 'disponible').length || 0;
  const vehiculosEnUso = allVehiculos.filter((v: any) => v.estado === 'en_uso').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-[#2a1a2b]">
      <Navbar />
      
      <div className="p-6 lg:p-10">
        {/* Encabezado */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-10 bg-[#7FA2C8] rounded-r"></div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              GESTIÓN DE FLOTA
            </h1>
          </div>
          <p className="text-[#7B97BC] font-medium tracking-wide pl-6">
            Control y administración de vehículos operativos
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
            onClick={() => setFiltro('inactivos')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${
              filtro === 'inactivos'
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white border-red-400'
                : 'bg-gray-800/50 text-[#7B97BC] border-gray-700/50 hover:border-red-500/50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            INACTIVOS
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

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-[#5A1E5C]/80 to-[#6A2A6E]/80 border-2 border-[#7B97BC]/30 rounded-2xl p-6 shadow-xl hover:shadow-[#7FA2C8]/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#7B97BC] font-bold text-lg uppercase tracking-wider">UNIDADES ACTIVAS</h3>
                <p className="text-5xl font-black text-white mt-2">{vehiculosActivos}</p>
              </div>
              <div className="bg-[#7FA2C8]/20 p-4 rounded-xl border border-[#7FA2C8]/50">
                <svg className="w-8 h-8 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-900/80 to-emerald-800/80 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl hover:shadow-emerald-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-emerald-400 font-bold text-lg uppercase tracking-wider">DISPONIBLES</h3>
                <p className="text-5xl font-black text-white mt-2">{vehiculosDisponibles}</p>
              </div>
              <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/50">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-900/80 to-amber-800/80 border-2 border-amber-500/30 rounded-2xl p-6 shadow-xl hover:shadow-amber-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-amber-400 font-bold text-lg uppercase tracking-wider">EN OPERACIÓN</h3>
                <p className="text-5xl font-black text-white mt-2">{vehiculosEnUso}</p>
              </div>
              <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-500/50">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Header con botón */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-3 rounded-xl">
              <svg className="w-7 h-7 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              REGISTRO DE VEHÍCULOS
            </h2>
          </div>
          
          <button
            onClick={() => !showForm ? setShowForm(true) : handleCancel()}
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
                NUEVO VEHÍCULO
              </>
            )}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="mb-10 bg-gradient-to-br from-[#5A1E5C]/40 to-[#6A2A6E]/40 border-2 border-[#7B97BC]/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-3 rounded-xl">
                <svg className="w-8 h-8 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {editingId ? 'EDITAR VEHÍCULO' : 'REGISTRAR NUEVO VEHÍCULO'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placa */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      PLACA
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="EJ: ABC-123"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                  />
                </div>

                {/* Marca */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      MARCA
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="EJ: Toyota"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                  />
                </div>

                {/* Modelo */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      MODELO
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="EJ: Hilux"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                  />
                </div>

                {/* Año */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      AÑO
                    </div>
                  </label>
                  <input
                    type="number"
                    placeholder="EJ: 2023"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                  />
                </div>

                {/* Color */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      COLOR
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="EJ: Blanco"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#7FA2C8] to-[#5A8AC8] hover:from-[#6A92B8] hover:to-[#4A7AA8] text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {createMutation.isPending ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingId ? 'ACTUALIZANDO...' : 'REGISTRANDO...'}
                    </div>
                  ) : editingId ? 'ACTUALIZAR VEHÍCULO' : 'REGISTRAR VEHÍCULO'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-2xl border-2 border-gray-700 transition-all duration-300"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grid de vehículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#7FA2C8] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#7B97BC] font-semibold tracking-wider">
                  CARGANDO VEHÍCULOS...
                </span>
              </div>
            </div>
          ) : vehiculos && vehiculos.length > 0 ? (
            vehiculos.map((vehiculo: any) => (
            <div 
              key={vehiculo.id} 
              className={`bg-gradient-to-br from-[#5A1E5C]/50 to-[#6A2A6E]/50 border-2 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-[#7FA2C8]/30 hover:shadow-lg hover:-translate-y-1 ${
                !vehiculo.activo ? 'opacity-70 border-red-500/30' : 
                vehiculo.estado === 'disponible' ? 'border-emerald-500/30' :
                vehiculo.estado === 'en_uso' ? 'border-amber-500/30' :
                vehiculo.estado === 'mantenimiento' ? 'border-yellow-500/30' : 'border-red-500/30'
              }`}
            >
              {/* Header de la tarjeta */}
              <div className="bg-gradient-to-r from-[#5A1E5C] to-[#6A2A6E] px-6 py-4 border-b-2 border-[#7FA2C8]/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-white tracking-tight">
                    {vehiculo.placa}
                  </h3>
                  <div className={`px-3 py-1 rounded-lg font-bold text-xs ${
                    !vehiculo.activo ? 'bg-red-900/50 text-red-300 border border-red-500/30' :
                    vehiculo.estado === 'disponible' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30' :
                    vehiculo.estado === 'en_uso' ? 'bg-amber-900/50 text-amber-300 border border-amber-500/30' :
                    vehiculo.estado === 'mantenimiento' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' :
                    'bg-red-900/50 text-red-300 border border-red-500/30'
                  }`}>
                    {vehiculo.estado?.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-6">
                {/* Información del vehículo */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#6A2A6E] p-2 rounded-lg">
                      <svg className="w-5 h-5 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">{vehiculo.marca} {vehiculo.modelo}</div>
                      <div className="text-[#7B97BC] text-sm">Especificaciones del vehículo</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/30 p-3 rounded-xl">
                      <div className="text-[#7B97BC] text-xs font-bold uppercase tracking-wider">AÑO</div>
                      <div className="text-white font-bold text-lg">{vehiculo.ano}</div>
                    </div>
                    <div className="bg-gray-900/30 p-3 rounded-xl">
                      <div className="text-[#7B97BC] text-xs font-bold uppercase tracking-wider">COLOR</div>
                      <div className="text-white font-bold text-lg">{vehiculo.color || '—'}</div>
                    </div>
                  </div>

                  <div className="bg-gray-900/30 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[#7B97BC] text-xs font-bold uppercase tracking-wider">KILOMETRAJE</div>
                      <div className="bg-[#5A1E5C] px-2 py-1 rounded text-xs text-[#7FA2C8] font-bold">
                        ACTUAL
                      </div>
                    </div>
                    <div className="text-3xl font-black text-white text-center">
                      {vehiculo.kilometrajeActual}
                      <span className="text-[#7B97BC] text-lg ml-2">km</span>
                    </div>
                  </div>
                </div>

                {/* Indicador de estado activo */}
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-6 ${
                  vehiculo.activo 
                    ? 'bg-emerald-900/30 border border-emerald-500/30' 
                    : 'bg-red-900/30 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${vehiculo.activo ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-pulse'}`}></div>
                    <span className={`font-bold ${vehiculo.activo ? 'text-emerald-400' : 'text-red-400'}`}>
                      {vehiculo.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${vehiculo.activo ? 'text-emerald-300' : 'text-red-300'}`}>
                    {vehiculo.activo ? 'OPERATIVO' : 'SUSPENDIDO'}
                  </span>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleEdit(vehiculo)}
                    className="w-full bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] hover:from-[#6A92B8] hover:to-[#6A87AC] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      EDITAR ESPECIFICACIONES
                    </div>
                  </button>
                  
                  <button
                    onClick={() => toggleActivoMutation.mutate(vehiculo.id)}
                    disabled={toggleActivoMutation.isPending}
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 ${
                      vehiculo.activo 
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white' 
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white'
                    }`}
                  >
                    {toggleActivoMutation.isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        PROCESANDO...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {vehiculo.activo ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        {vehiculo.activo ? 'DESACTIVAR UNIDAD' : 'ACTIVAR UNIDAD'}
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Seguro que quieres eliminar el vehículo ${vehiculo.placa}? Esta acción no se puede deshacer.`)) {
                        deleteMutation.mutate(vehiculo.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ELIMINANDO...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        ELIMINAR DE LA FLOTA
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer de la tarjeta */}
              <div className="bg-gradient-to-r from-[#5A1E5C]/80 to-[#6A2A6E]/80 px-6 py-3 border-t-2 border-[#7FA2C8]/30">
                <div className="flex items-center justify-between">
                  <span className="text-[#7B97BC] text-xs font-medium">
                    ID: {vehiculo.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      vehiculo.estado === 'disponible' ? 'bg-emerald-400' :
                      vehiculo.estado === 'en_uso' ? 'bg-amber-400' :
                      vehiculo.estado === 'mantenimiento' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-white text-xs font-bold">
                      {vehiculo.activo ? 'OPERATIVO' : 'INACTIVO'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="bg-gradient-to-br from-[#5A1E5C]/40 to-[#6A2A6E]/40 border-2 border-[#7B97BC]/30 rounded-2xl p-12 inline-block">
                <svg className="w-20 h-20 text-[#7B97BC] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-2xl font-bold text-white mb-3">SIN VEHÍCULOS REGISTRADOS</h3>
                <p className="text-[#7B97BC] mb-6">No hay vehículos en la flota actualmente</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-[#7FA2C8] to-[#5A8AC8] hover:from-[#6A92B8] hover:to-[#4A7AA8] text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    REGISTRAR PRIMER VEHÍCULO
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}