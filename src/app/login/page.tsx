'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Intentamos iniciar sesión con las credenciales
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false, // No redirigir automático para poder manejar errores
    });

    if (res?.error) {
      setError('Credenciales inválidas');
      setLoading(false);
    } else {
      // Login exitoso -> Ir al dashboard
      router.push('/admin'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA] px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-xl rounded-lg border border-stone-200">
        
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-stone-800 tracking-wider">DAS CORTEZ</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500 mt-2">Acceso Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-stone-300 rounded focus:outline-none focus:border-stone-800 transition-colors bg-stone-50"
              placeholder="correo@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-stone-300 rounded focus:outline-none focus:border-stone-800 transition-colors bg-stone-50"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 text-[#F4F1EA] font-bold py-3 px-4 rounded hover:bg-stone-700 transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}