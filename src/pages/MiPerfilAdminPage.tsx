import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { api } from '../services/api';

export function MiPerfilAdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmPassword: '',
  });

  // Query para obtener el perfil del usuario
  const { data: perfil, isLoading } = useQuery({
    queryKey: ['mi-perfil'],
    queryFn: async () => {
      const response = await api.get('/usuarios/mi-perfil');
      return response.data;
    },
  });

  // Mutation para cambiar contraseña
  const cambiarContrasenaMutation = useMutation({
    mutationFn: async () => {
      if (passwords.passwordNueva !== passwords.confirmPassword) {
        throw new Error('Las contraseñas nuevas no coinciden');
      }
      return api.put('/usuarios/cambiar-contrasena', {
        passwordActual: passwords.passwordActual,
        passwordNueva: passwords.passwordNueva,
      });
    },
    onSuccess: () => {
      addToast('Contraseña actualizada exitosamente', 'success');
      setPasswords({ passwordActual: '', passwordNueva: '', confirmPassword: '' });
      setShowPasswordForm(false);
      queryClient.invalidateQueries({ queryKey: ['mi-perfil'] });
    },
    onError: (error: any) => {
      addToast(error.message || 'Error al cambiar la contraseña', 'error');
    },
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    cambiarContrasenaMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5A1E5C] to-[#3D1441] flex items-center justify-center">
        <div className="text-white text-xl">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5A1E5C] to-[#3D1441] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Mi Perfil</h1>
          <p className="text-[#7FA2C8] text-lg">Administrador - Gestiona tu información personal</p>
        </div>

        {/* Grid de tarjetas */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tarjeta de Información Personal */}
          <div className="bg-[#6A2A6E]/80 backdrop-blur-sm border-2 border-[#7FA2C8] rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#7FA2C8]/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Información Personal</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider">Nombre</label>
                <p className="text-white text-lg font-medium mt-2 bg-[#5A1E5C] px-4 py-3 rounded-lg border border-[#7B97BC]/30">
                  {perfil?.nombre}
                </p>
              </div>

              <div>
                <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider">Email</label>
                <p className="text-white text-lg font-medium mt-2 bg-[#5A1E5C] px-4 py-3 rounded-lg border border-[#7B97BC]/30">
                  {perfil?.email}
                </p>
              </div>

              <div>
                <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider">Teléfono</label>
                <p className="text-white text-lg font-medium mt-2 bg-[#5A1E5C] px-4 py-3 rounded-lg border border-[#7B97BC]/30">
                  {perfil?.telefono}
                </p>
              </div>

              <div>
                <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider">Rol</label>
                <p className="text-white text-lg font-medium mt-2 bg-[#5A1E5C] px-4 py-3 rounded-lg border border-[#7B97BC]/30">
                  Administrador
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Seguridad */}
          <div className="bg-[#6A2A6E]/80 backdrop-blur-sm border-2 border-[#7FA2C8] rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#7FA2C8]/20 p-3 rounded-lg">
                <svg className="w-6 h-6 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Seguridad</h2>
            </div>

            <div className="space-y-4">
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full bg-[#7FA2C8] hover:bg-[#6B8FB0] text-[#5A1E5C] font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Cambiar Contraseña
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider">Contraseña Actual</label>
                    <input
                      type="password"
                      value={passwords.passwordActual}
                      onChange={(e) => setPasswords({ ...passwords, passwordActual: e.target.value })}
                      className="w-full mt-2 bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-lg focus:border-[#7FA2C8] outline-none transition-colors"
                      placeholder="Ingresa tu contraseña actual"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider">Contraseña Nueva</label>
                    <input
                      type="password"
                      value={passwords.passwordNueva}
                      onChange={(e) => setPasswords({ ...passwords, passwordNueva: e.target.value })}
                      className="w-full mt-2 bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-lg focus:border-[#7FA2C8] outline-none transition-colors"
                      placeholder="Ingresa tu nueva contraseña"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[#7FA2C8] text-sm font-semibold uppercase tracking-wider">Confirmar Contraseña</label>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className="w-full mt-2 bg-[#5A1E5C] border-2 border-[#7B97BC]/30 text-white px-4 py-3 rounded-lg focus:border-[#7FA2C8] outline-none transition-colors"
                      placeholder="Confirma tu nueva contraseña"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={cambiarContrasenaMutation.isPending}
                      className="flex-1 bg-[#7FA2C8] hover:bg-[#6B8FB0] disabled:bg-gray-500 text-[#5A1E5C] font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      {cambiarContrasenaMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswords({ passwordActual: '', passwordNueva: '', confirmPassword: '' });
                      }}
                      className="flex-1 bg-[#5A1E5C] hover:bg-[#6A2A6E] border-2 border-[#7FA2C8] text-[#7FA2C8] font-bold py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Botón Volver */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="group relative px-8 py-3 bg-[#6A2A6E] hover:bg-[#7FA2C8] border-2 border-[#7FA2C8] text-[#7FA2C8] hover:text-[#5A1E5C] font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
