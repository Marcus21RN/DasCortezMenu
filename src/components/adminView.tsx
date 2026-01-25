'use client';

import { useState } from 'react';
import Link from 'next/link';

// Definición de tipos
interface Product {
  _id: string;
  name: string;
  category: { _id: string; name: string }; 
  price?: number | null;
  priceHot?: number | null;
  priceCold?: number | null;
  available: boolean;
  drinkType: string;
}

interface AdminViewProps {
  initialProducts: Product[];
}

export default function AdminView({ initialProducts }: AdminViewProps) {
  // Inicializamos el estado con los datos que vienen del servidor
  const [products] = useState<Product[]>(initialProducts);
  
  // Estados Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');

  // Lógica de Filtrado
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const categoryName = product.category?.name || 'Sin Categoría';
    const matchesCategory = filterCategory === 'Todas' || categoryName === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'Activos') matchesStatus = product.available === true;
    if (filterStatus === 'Inactivos') matchesStatus = product.available === false;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const uniqueCategories = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)));

  return (
    <div className="pb-20">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="font-serif text-3xl font-bold text-stone-800">Gestionar Productos</h1>
        <Link 
          href="/admin/nuevo" 
          className="bg-stone-900 hover:bg-stone-700 text-[#F4F1EA] font-bold py-3 px-6 rounded uppercase tracking-wider text-sm shadow-lg transition-all w-full md:w-auto text-center"
        >
          + Nuevo Producto
        </Link>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Buscar</label>
          <input 
            type="text" 
            placeholder="Ej. Latte..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-stone-300 rounded bg-stone-50 focus:border-stone-800 outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Categoría</label>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-3 border border-stone-300 rounded-lg bg-stone-50 focus:border-stone-800 outline-none appearance-none text-sm"
          >
            <option value="Todas">Todas las categorías</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Estado</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-3 border border-stone-300 rounded-lg bg-stone-50 focus:border-stone-800 outline-none appearance-none text-sm"
          >
            <option value="Todos">Todos</option>
            <option value="Activos">Solo Activos</option>
            <option value="Inactivos">Solo Inactivos</option>
          </select>
        </div>
      </div>

      {/* --- VISTA DE TABLA (DESKTOP) --- */}
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-100 text-stone-800 uppercase tracking-wider font-bold text-xs border-b border-stone-200">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 w-40">Precios</th> 
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-stone-900 align-middle">{product.name}</td>
                  <td className="px-6 py-4 align-middle">
                    <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs font-medium border border-stone-200">
                      {product.category?.name || '---'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 align-middle">
                    {product.drinkType === 'General' ? (
                       <span className="font-bold text-stone-800 text-base border-stone-800 pl-2">
                         ${product.price}
                       </span>
                    ) : (
                       <div className="flex flex-col gap-1 items-start">
                         {product.drinkType !== 'Frio' && product.priceHot && (
                           <div className="flex items-center gap-2 text-xs font-bold text-orange-800 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md min-w-20">
                             <span>🔥</span> <span>${product.priceHot}</span>
                           </div>
                         )}
                         
                         {product.drinkType !== 'Caliente' && product.priceCold && (
                           <div className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md min-w-20">
                             <span>❄️</span> <span>${product.priceCold}</span>
                           </div>
                         )}
                       </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center align-middle">
                    {product.available ? (
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full ring-4 ring-green-100"></span>
                    ) : (
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full ring-4 ring-red-100"></span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <Link 
                      href={`/admin/editar/${product._id}`}
                      className="text-stone-500 hover:text-stone-900 font-bold text-xs uppercase tracking-wider border border-stone-300 hover:border-stone-800 px-3 py-1 rounded transition-all"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VISTA DE TARJETAS (MÓVIL) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded-lg shadow border border-stone-200 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-stone-900 text-lg">{product.name}</h3>
                <span className="text-xs text-stone-500 uppercase tracking-wide">{product.category?.name || '---'}</span>
              </div>
              {product.available ? (
                <span className="bg-green-100 text-green-800 py-1 px-2 rounded text-[0.6rem] font-bold uppercase">Activo</span>
              ) : (
                <span className="bg-red-100 text-red-800 py-1 px-2 rounded text-[0.6rem] font-bold uppercase">Agotado</span>
              )}
            </div>

            <div className="mt-2 text-sm text-stone-700 bg-stone-50 p-2 rounded">
               {product.drinkType === 'General' ? (
                  <span className="font-bold block text-center">Precio: ${product.price}</span>
               ) : (
                  <div className="flex justify-around">
                    {product.priceHot && <span className="text-orange-700 font-bold">🔥 ${product.priceHot}</span>}
                    {product.priceCold && <span className="text-blue-700 font-bold">❄️ ${product.priceCold}</span>}
                  </div>
               )}
            </div>

            <Link 
              href={`/admin/editar/${product._id}`}
              className="mt-2 text-center w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2 rounded text-sm transition-colors border border-stone-300"
            >
              Editar Producto
            </Link>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-8 text-center text-stone-400 mt-4 bg-white rounded border border-stone-200">
          No se encontraron productos con esos filtros.
        </div>
      )}
    </div>
  );
}