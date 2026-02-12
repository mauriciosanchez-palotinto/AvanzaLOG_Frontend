import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.usuario, data.token);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Error de autenticación');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#3a2a3b] to-[#5A1E5C] flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Líneas de cuadrícula */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute h-px bg-white w-full" style={{ top: `${i * 5}%` }}></div>
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-px bg-white h-full" style={{ left: `${i * 5}%` }}></div>
          ))}
        </div>
        
        {/* Círculos decorativos */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#7FA2C8]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6A2A6E]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-[#5A1E5C]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#5A1E5C]/90 to-[#6A2A6E]/90 border-2 border-[#7B97BC]/30 rounded-3xl shadow-2xl overflow-hidden z-10">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-[#5A1E5C] via-[#6A2A6E] to-[#5A1E5C] p-8 border-b-2 border-[#7FA2C8]/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[#7FA2C8] to-[#7B97BC] p-3 rounded-xl">
                <svg className="w-10 h-10 text-[#5A1E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white">
                  LOGÍSTICA<span className="text-[#7FA2C8]">PTN</span>
                </h1>
                <p className="text-[#7B97BC] font-medium tracking-wide">
                  SISTEMA DE GESTIÓN DE FLOTA
                </p>
              </div>
            </div>
            
            <div className="bg-[#7FA2C8]/20 p-4 rounded-xl border border-[#7FA2C8]/50">
              <div className="text-center">
                <div className="text-white text-sm font-bold tracking-wider">ACCESO SEGURO</div>
                <div className="text-[#7FA2C8] text-xs mt-1">VERSIÓN 1.0</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Panel izquierdo - Información */}
          <div className="p-10 bg-gradient-to-br from-[#5A1E5C]/60 to-[#6A2A6E]/60 border-r-2 border-[#7B97BC]/30">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
                  <span className="text-[#7FA2C8]">//</span> CONTROL DE ACCESO
                </h2>
                <p className="text-[#7B97BC] leading-relaxed">
                  Sistema de gestión vehicular. Acceda con sus credenciales autorizadas.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-[#5A1E5C]/30 rounded-xl border border-[#7B97BC]/20">
                  <div className="bg-emerald-900/50 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Autenticación Segura</h3>
                    <p className="text-[#7B97BC] text-sm">Conexión encriptada SSL/TLS</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#5A1E5C]/30 rounded-xl border border-[#7B97BC]/20">
                  <div className="bg-[#7FA2C8]/20 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-[#7FA2C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Control en Tiempo Real</h3>
                    <p className="text-[#7B97BC] text-sm">Monitoreo de flota vehicular</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-[#5A1E5C]/30 rounded-xl border border-[#7B97BC]/20">
                  <div className="bg-amber-900/50 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Acceso Restringido</h3>
                    <p className="text-[#7B97BC] text-sm">Solo personal autorizado</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#7B97BC]/30">
                <p className="text-[#7B97BC] text-sm text-center">
                  Sistema exlusivo de PTN
                </p>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario */}
          <div className="p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                INICIO DE SESIÓN
              </h2>
              <p className="text-[#7B97BC]">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div className="relative group">
                <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    IDENTIFICACIÓN DE USUARIO
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-12 py-4 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all"
                    placeholder="correo@empresa.com"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-[#7B97BC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="relative group">
                <label className="block text-[#7FA2C8] font-bold mb-2 tracking-wider text-sm uppercase">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    CREDENCIAL DE ACCESO
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900/50 border-2 border-[#7B97BC]/30 text-white px-12 py-4 rounded-xl focus:border-[#7FA2C8] focus:ring-2 focus:ring-[#7FA2C8]/50 transition-all pr-12"
                    placeholder="••••••••••"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-[#7B97BC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7B97BC] hover:text-[#7FA2C8] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Recordar contraseña (opcional) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 bg-gray-900 border-2 border-[#7B97BC]/30 rounded focus:ring-[#7FA2C8]"
                  />
                  <label htmlFor="remember" className="ml-2 text-[#7B97BC] text-sm">
                    Mantener sesión activa
                  </label>
                </div>
                <button
                  type="button"
                  className="text-[#7FA2C8] hover:text-white text-sm font-medium transition-colors"
                >
                  ¿Olvidó sus credenciales?
                </button>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border-2 border-red-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-900 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <span className="text-red-300 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Botón de login */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-gradient-to-r from-[#7FA2C8] to-[#5A8AC8] hover:from-[#6A92B8] hover:to-[#4A7AA8] text-white font-bold py-4 px-6 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    AUTENTICANDO...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    INGRESAR AL SISTEMA
                  </div>
                )}
              </button>

              {/* Línea divisora */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#7B97BC]/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-[#5A1E5C]/90 to-[#6A2A6E]/90 text-[#7B97BC]">
                    ACCESO AL SISTEMA
                  </span>
                </div>
              </div>

              {/* Enlace de registro */}
              <div className="text-center">
                <p className="text-[#7B97BC]">
                  ¿No tiene credenciales?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-[#7FA2C8] hover:text-white font-bold transition-colors"
                  >
                    Solicite acceso aquí
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-[#5A1E5C] to-[#6A2A6E] px-8 py-4 border-t-2 border-[#7FA2C8]/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[#7B97BC] text-sm">
              © 2026 LOGÍSTICA PTN • Sistema de Gestión Industrial
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-medium">SERVIDOR CONECTADO</span>
              </div>
              <div className="text-[#7B97BC] text-xs">
                v2.4.1 • Build 2024.12
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nota de seguridad en la esquina */}
      <div className="fixed bottom-4 right-4 bg-gradient-to-r from-[#5A1E5C] to-[#6A2A6E] border border-[#7FA2C8]/30 rounded-lg p-3 shadow-lg z-20">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-white text-xs font-medium">Conexión segura activa</span>
        </div>
      </div>
    </div>
  );
}