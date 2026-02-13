import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Navbar } from '../../components/Navbar';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';

export function MiPerfilPage() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      if (data.nueva !== data.confirmar) {
        throw new Error('Las contraseñas no coinciden');
      }
      const response = await api.put('/usuarios/cambiar-contrasena', {
        passwordActual: data.actual,
        passwordNueva: data.nueva,
      });
      return response.data;
    },
    onSuccess: () => {
      setPasswordData({ actual: '', nueva: '', confirmar: '' });
      addToast('Contraseña actualizada correctamente', 'success');
    },
    onError: (error: any) => {
      addToast(error.response?.data?.message || 'Error al cambiar la contraseña', 'error');
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordData);
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
              MI PERFIL
            </h1>
          </div>
          <p className="text-[#7B97BC] font-medium tracking-wide pl-6">
            Gestiona tu información personal
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Personal */}
          <div className="lg:col-span-1 bg-gradient-to-br from-[#5A1E5C]/50 to-[#6A2A6E]/50 border-2 border-[#7B97BC]/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-3 rounded-xl">
                <svg className="w-8 h-8 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white">DATOS PERSONALES</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#7B97BC] text-xs uppercase font-bold">Nombre</label>
                <p className="text-white font-bold text-lg">{user?.nombre || '-'}</p>
              </div>

              <div>
                <label className="text-[#7B97BC] text-xs uppercase font-bold">Email</label>
                <p className="text-white font-bold text-lg">{user?.email || '-'}</p>
              </div>

{/*               <div>
                <label className="text-[#7B97BC] text-xs uppercase font-bold">Teléfono</label>
                <p className="text-white font-bold text-lg">{user?.telefono || '-'}</p>
              </div> */}

              <div>
                <label className="text-[#7B97BC] text-xs uppercase font-bold">Rol</label>
                <p className={`font-bold text-lg ${user?.esAdmin ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {user?.esAdmin ? 'Administrador' : 'Usuario'}
                </p>
              </div>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#5A1E5C]/50 to-[#6A2A6E]/50 border-2 border-[#7B97BC]/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-3 rounded-xl">
                <svg className="w-8 h-8 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white">CAMBIAR CONTRASEÑA</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={passwordData.actual}
                  onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
                  className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.nueva}
                  onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })}
                  className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmar}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
                  className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full bg-gradient-to-r from-[#7FA2C8] to-[#5A8AC8] hover:from-[#6A92B8] hover:to-[#4A7AA8] text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {changePasswordMutation.isPending ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ACTUALIZANDO...
                  </div>
                ) : (
                  'CAMBIAR CONTRASEÑA'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
