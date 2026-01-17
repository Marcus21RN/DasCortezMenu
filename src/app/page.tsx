'use client';

import { useEffect, useState } from 'react';

// Tipos de datos (Interface)
interface Product {
  _id: string;
  name: string;
  description?: string;
  priceHot?: number;
  priceCold?: number;
  // Precio único para items de 'Extras'
  price?: number;
  drinkType: 'Caliente' | 'Frio' | 'Ambos' | 'General';
  isSeasonal: boolean;
}

interface CategoryWithProducts {
  _id: string;
  name: string;
  slug: string;
  products: Product[];
}

export default function MenuPage() {
  const [menu, setMenu] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch de datos al cargar la página
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-stone-400 rounded-full mb-4"></div>
          <p className="font-serif text-stone-600 text-lg">Preparando café...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F1EA] px-4 py-8 md:py-12 text-[#1C1C1C]">
      {/* --- HEADER / LOGO --- */}
      <header className="mb-12 text-center max-w-2xl mx-auto">
        {/* Espacio para Logo */}
        <div className="mx-auto w-48 h-24 relative mb-4 flex items-center justify-center">
           {/* Si tienes el logo, descomenta la línea de Image y borra el h1 */}
           {/* <Image src="/logo.png" alt="Das Cortez" fill className="object-contain" /> */}
           
           {/* Placeholder tipográfico elegante mientras consigues el SVG del logo */}
           <div className="text-center">
             <h1 className="font-serif text-4xl tracking-widest font-bold uppercase border-b-2 border-black pb-2 inline-block">
               Das Cortez
             </h1>
             <p className="text-xs tracking-[0.3em] mt-1 uppercase text-stone-600">Cafés Finos</p>
           </div>
        </div>
      </header>

      {/* --- LISTA DE CATEGORÍAS --- */}
      <div className="max-w-3xl mx-auto space-y-12">
        {menu.map((category) => (
          <section key={category._id} className="break-inside-avoid">
            
            {/* Título de Categoría */}
            <div className="flex items-end justify-between mb-6 border-b border-stone-300 pb-2">
              <h2 className="font-serif text-xl md:text-2xl font-bold tracking-wider uppercase text-stone-800">
                {category.name}
              </h2>
              
              {/* Encabezados de precios (Solo visual, si la categoría tiene bebidas dobles) */}
              {['Bebidas a base de Espresso', 'Tés y Tisanas'].includes(category.name) && (
                <div className="hidden md:flex text-xs font-bold tracking-widest text-stone-500 gap-8 pr-2">
                  <span>CALIENTE</span>
                  <span>FRÍO</span>
                </div>
              )}
            </div>

            {/* Lista de Productos */}
            <ul className="space-y-6">
              {category.products.map((product) => (
                <li key={product._id} className="group">
                  <div className="flex justify-between items-baseline w-full">
                    
                    {/* Izquierda: Nombre + Puntos suspensivos */}
                    <div className="grow flex items-baseline overflow-hidden relative">
                      <h3 className="font-bold text-base md:text-lg font-sans text-stone-900 shrink-0 pr-2">
                        {product.name}
                        {product.isSeasonal && (
                          <span className="ml-2 text-[0.6rem] align-top bg-stone-800 text-[#F4F1EA] px-1 py-0.5 rounded uppercase tracking-wider">
                            Temp
                          </span>
                        )}
                      </h3>
                      {/* Línea punteada decorativa */}
                      <span className="border-b-2 border-dotted border-stone-300 w-full h-1 grow min-w-4 -translate-y-1"></span>
                    </div>

                    {/* Derecha: Precios */}
                    <div className="flex items-center gap-4 pl-2 font-sans font-bold text-stone-800 text-lg md:text-lg whitespace-nowrap">
                      {/* Lógica de visualización de precios */}

                      {/* Caso 2: Solo frío */}
                      {product.drinkType === 'Frio' && (
                        <span>${product.priceCold}</span>
                      )}

                       {/* Caso 3: Solo caliente */}
                       {product.drinkType === 'Caliente' && (
                        <span>${product.priceHot}</span>
                      )}

                      {/* Caso 1b: Precio único (Extras / General) */}
                      {product.drinkType === 'General' && (
                        <span>${product.price}</span>
                      )}

                      {/* Caso 4: Ambos precios (Estilo dual) */}
                      {product.drinkType === 'Ambos' && (
                        <div className="flex gap-4 md:gap-8 text-right">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <span className="md:hidden text-[0.6rem] text-stone-500 font-normal uppercase mr-1">C</span>
                            <span>${product.priceHot}</span>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center">
                            <span className="md:hidden text-[0.6rem] text-stone-500 font-normal uppercase mr-1">F</span>
                            <span>${product.priceCold}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descripción debajo */}
                  {product.description && (
                    <p className="text-sm text-stone-500 font-sans mt-1 leading-tight max-w-[85%]">
                      {product.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Footer Sencillo */}
      <footer className="mt-20 text-center text-stone-400 text-xs font-sans tracking-widest uppercase">
        <p>© {new Date().getFullYear()} Das Cortez</p>
      </footer>
    </main>
  );
}