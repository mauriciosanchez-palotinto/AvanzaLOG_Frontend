import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { NotificacionesBadge } from './NotificacionesBadge';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-[#5A1E5C] to-[#6A2A6E] border-b-4 border-[#7FA2C8] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo y menú principal */}
          <div className="flex items-center gap-10">
            <Link 
              to="/dashboard" 
              className="group flex items-center gap-3"
            >
              <div className="bg-[#7FA2C8] p-2.5 rounded-lg transform group-hover:rotate-12 transition-transform duration-300">
                <svg 
                  className="w-7 h-7 text-[#5A1E5C]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2.5" 
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter text-white">
                  LOGÍSTICA
                </span>
                <span className="font-bold text-xl tracking-widest text-[#7FA2C8]">
                  PTN
                </span>
              </div>
            </Link>
            
            {/* Línea divisoria */}
            <div className="hidden md:block h-8 w-0.5 bg-[#7B97BC] opacity-60"></div>

            {/* Navegación principal */}
            <div className="hidden md:flex gap-1 bg-[#5A1E5C]/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#7B97BC]/30">
              <Link 
                to="/dashboard" 
                className="relative px-4 py-3 text-[#7FA2C8] hover:text-white group transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#6A2A6E] p-1.5 rounded-md group-hover:bg-[#7FA2C8] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="font-semibold">Dashboard</span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-[#7FA2C8] rounded-t-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
              </Link>

              <Link 
                to="/viajes" 
                className="relative px-4 py-3 text-[#7FA2C8] hover:text-white group transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#6A2A6E] p-1.5 rounded-md group-hover:bg-[#7FA2C8] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Viajes</span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-[#7FA2C8] rounded-t-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
              </Link>

              <Link 
                to="/vehiculos" 
                className="relative px-4 py-3 text-[#7FA2C8] hover:text-white group transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#6A2A6E] p-1.5 rounded-md group-hover:bg-[#7FA2C8] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <span className="font-semibold">Vehículos</span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-[#7FA2C8] rounded-t-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
              </Link>

              <Link 
                to="/usuarios" 
                className="relative px-4 py-3 text-[#7FA2C8] hover:text-white group transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#6A2A6E] p-1.5 rounded-md group-hover:bg-[#7FA2C8] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.201V21" />
                    </svg>
                  </div>
                  <span className="font-semibold">Usuarios</span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-[#7FA2C8] rounded-t-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
              </Link>
            </div>
          </div>

          {/* Sección de usuario */}
          <div className="flex items-center gap-6">
            {/* Notificaciones */}
            <div className="relative">
              <NotificacionesBadge />
            </div>

            {/* Divisor */}
            <div className="h-8 w-0.5 bg-[#7B97BC] opacity-60"></div>

            {/* Usuario */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-[#6A2A6E] p-2 rounded-full border-2 border-[#7FA2C8] group-hover:border-white transition-colors">
                <svg className="w-6 h-6 text-[#7FA2C8] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{user?.nombre}</span>
                <span className="text-xs text-[#7FA2C8] font-medium">Operador</span>
              </div>
            </div>

            {/* Botón Logout */}
            <button
              onClick={handleLogout}
              className="group relative px-5 py-2.5 bg-[#6A2A6E] hover:bg-[#7FA2C8] border-2 border-[#7FA2C8] rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#7FA2C8] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-semibold text-[#7FA2C8] group-hover:text-white transition-colors">Salir</span>
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}