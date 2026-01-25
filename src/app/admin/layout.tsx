"use client";

import React from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* --- BARRA DE NAVEGACIÓN SUPERIOR --- */}
      <nav className="bg-stone-900 text-[#F4F1EA] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo / Título del Panel */}
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center">
                <Image
                  src="/Logo-NOBG.png"
                  alt="Das Cortez logo"
                  width={180}
                  height={48}
                  className="object-contain"
                />
                <span className="sr-only">DAS CORTEZ | Admin</span>
              </Link>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center gap-6">
              {/* Link para ver el sitio real (abre en pestaña nueva) */}
              <Link 
                href="/" 
                target="_blank" 
                className="hidden md:block text-xs uppercase tracking-[0.2em] font-bold hover:text-stone-300 transition-colors"
              >
                Ver Menú Público ↗
              </Link>

              {/* Botón de Cerrar Sesión */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-red-700 hover:bg-red-800 text-white text-xs uppercase tracking-widest font-bold py-2 px-4 rounded transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- CONTENIDO PRINCIPAL (Aquí se cargarán tus formularios y tablas) --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
