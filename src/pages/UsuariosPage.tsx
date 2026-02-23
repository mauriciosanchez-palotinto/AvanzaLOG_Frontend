import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { Navbar } from '../components/Navbar';

export function UsuariosPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    passwordConfirm: '',
  });

  const { data: usuarios, isLoading, refetch } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await api.get('/usuarios');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingId) {
        return await api.put(`/usuarios/${editingId}`, data);
      }
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      setFormData({ nombre: '', email: '', telefono: '', password: '', passwordConfirm: '' });
      setEditingId(null);
      setShowForm(false);
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/usuarios/${id}`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const toggleActivoMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.put(`/usuarios/${id}/toggle-activo`, {});
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleEdit = (usuario: any) => {
    setEditingId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono || '',
      password: '',
      passwordConfirm: '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ nombre: '', email: '', telefono: '', password: '', passwordConfirm: '' });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan cuando no estamos editando
    if (!editingId && formData.password !== formData.passwordConfirm) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    // Si estamos editando, no incluir passwordConfirm
    if (editingId) {
      const { passwordConfirm, ...dataToSend } = formData;
      createMutation.mutate(dataToSend as typeof formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-[#2a1a2b] flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#7FA2C8] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#7FA2C8] font-semibold tracking-wider">
            CARGANDO USUARIOS...
          </span>
        </div>
      </div>
    );
  }

  // Estadísticas
  const usuariosActivos = usuarios?.filter((u: any) => u.activo).length || 0;
  const totalUsuarios = usuarios?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-[#2a1a2b]">
      <Navbar />
      
      <div className="p-6 lg:p-10">
        {/* Encabezado */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-10 bg-[#7FA2C8] rounded-r"></div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              GESTIÓN DE PERSONAL
            </h1>
          </div>
          <p className="text-[#7B97BC] font-medium tracking-wide pl-6">
            Administración y control de operadores autorizados
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-br from-[#5A1E5C]/80 to-[#6A2A6E]/80 border-2 border-[#7B97BC]/30 rounded-2xl p-6 shadow-xl hover:shadow-[#7FA2C8]/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#7B97BC] font-bold text-lg uppercase tracking-wider">TOTAL USUARIOS</h3>
                <p className="text-5xl font-black text-white mt-2">{totalUsuarios}</p>
              </div>
              <div className="bg-[#7FA2C8]/20 p-4 rounded-xl border border-[#7FA2C8]/50">
                <svg className="w-8 h-8 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.201V21" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-900/80 to-emerald-800/80 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl hover:shadow-emerald-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-emerald-400 font-bold text-lg uppercase tracking-wider">PERSONAL ACTIVO</h3>
                <p className="text-5xl font-black text-white mt-2">{usuariosActivos}</p>
              </div>
              <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/50">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.201V21" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              REGISTRO DE OPERADORES
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
                NUEVO OPERADOR
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
                {editingId ? 'EDITAR OPERADOR' : 'REGISTRAR NUEVO OPERADOR'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      NOMBRE COMPLETO
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="EJ: Juan Pérez"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      CORREO ELECTRÓNICO
                    </div>
                  </label>
                  <input
                    type="email"
                    placeholder="EJ: juan@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required
                  />
                </div>

                {/* Teléfono */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      TELÉFONO
                    </div>
                  </label>
                  <input
                    type="tel"
                    placeholder="EJ: +52 123 456 7890"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                  />
                </div>

                {/* Contraseña */}
                <div className="relative group">
                  <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      {editingId ? 'CONTRASEÑA (OPCIONAL)' : 'CONTRASEÑA'}
                    </div>
                  </label>
                  <input
                    type="password"
                    placeholder={editingId ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    required={!editingId}
                  />
                </div>

                {/* Confirmar Contraseña */}
                {!editingId && (
                  <div className="relative group">
                    <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        CONFIRMAR CONTRASEÑA
                      </div>
                    </label>
                    <input
                      type="password"
                      placeholder="Repite la contraseña"
                      value={formData.passwordConfirm}
                      onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                      className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                      required
                    />
                  </div>
                )}
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
                  ) : editingId ? 'ACTUALIZAR OPERADOR' : 'REGISTRAR OPERADOR'}
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

        {/* Tabla de usuarios */}
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
                    LISTA DE OPERADORES
                  </h2>
                  <p className="text-[#7B97BC] text-sm font-medium tracking-wide">
                    Personal autorizado para operaciones vehiculares
                  </p>
                </div>
              </div>
              <div className="hidden lg:block">
                <span className="px-6 py-3 bg-[#7FA2C8] text-[#5A1E5C] font-bold rounded-xl">
                  {usuarios?.length || 0} OPERADORES
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
                      <span className="text-[#7FA2C8] font-bold tracking-wider">CONTACTO</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold tracking-wider">ESTADO</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[#7FA2C8] font-bold tracking-wider">ACCIONES</span>
                      <div className="w-1 h-4 bg-[#7FA2C8] rounded"></div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios?.map((usuario: any, index: number) => (
                  <tr 
                    key={usuario.id} 
                    className={`
                      border-b border-[#7B97BC]/20 
                      ${index % 2 === 0 ? 'bg-[#5A1E5C]/10' : 'bg-[#6A2A6E]/10'}
                      hover:bg-[#7FA2C8]/10 transition-colors duration-200
                    `}
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#6A2A6E] p-3 rounded-xl">
                          <svg className="w-6 h-6 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{usuario.nombre}</div>
                          <div className="text-[#7B97BC] text-sm">ID: {usuario.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-white font-medium">{usuario.email}</span>
                        </div>
                        {usuario.telefono && (
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-[#7B97BC]">{usuario.telefono}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${usuario.activo ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-pulse'}`}></div>
                        <span className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wider ${
                          usuario.activo 
                            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-red-900/50 text-red-300 border border-red-500/30'
                        }`}>
                          {usuario.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col lg:flex-row gap-3">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="flex-1 bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] hover:from-[#6A92B8] hover:to-[#6A87AC] text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            EDITAR
                          </div>
                        </button>
                        
                        <button
                          onClick={() => toggleActivoMutation.mutate(usuario.id)}
                          disabled={toggleActivoMutation.isPending}
                          className={`flex-1 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 ${
                            usuario.activo 
                              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white' 
                              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white'
                          }`}
                        >
                          {toggleActivoMutation.isPending ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {usuario.activo ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                              {usuario.activo ? 'DESACTIVAR' : 'ACTIVAR'}
                            </div>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro que quieres eliminar al operador ${usuario.nombre}? Esta acción no se puede deshacer.`)) {
                              deleteMutation.mutate(usuario.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              ELIMINAR
                            </div>
                          )}
                        </button>
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
                {usuarios?.length || 0} OPERADORES REGISTRADOS EN SISTEMA
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Activo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Inactivo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje cuando no hay usuarios */}
        {usuarios?.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-[#5A1E5C]/40 to-[#6A2A6E]/40 border-2 border-[#7B97BC]/30 rounded-2xl p-12 inline-block">
              <svg className="w-20 h-20 text-[#7B97BC] mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.201V21" />
              </svg>
              <h3 className="text-2xl font-bold text-white mb-3">SIN OPERADORES REGISTRADOS</h3>
              <p className="text-[#7B97BC] mb-6">No hay usuarios registrados en el sistema actualmente</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-[#7FA2C8] to-[#5A8AC8] hover:from-[#6A92B8] hover:to-[#4A7AA8] text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  REGISTRAR PRIMER OPERADOR
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}