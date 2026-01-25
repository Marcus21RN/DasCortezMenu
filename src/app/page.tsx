'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// --- TIPOS DE DATOS ---
interface Product {
  _id: string;
  name: string;
  description?: string;
  priceHot?: number;
  priceCold?: number;
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
  const [activeCategory, setActiveCategory] = useState('');
  
  // Estado del menú hamburguesa
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. Fetch de datos
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        if (data.length > 0) setActiveCategory(data[0]._id);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. NUEVO: Intersection Observer (Spy Scroll)
  // Detecta qué sección está visible y actualiza el botón activo
  useEffect(() => {
    if (loading || menu.length === 0) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Si la sección entra en la zona "activa", actualizamos el estado
          setActiveCategory(entry.target.id);
        }
      });
    };

    // Configuración del observador
    const observer = new IntersectionObserver(handleIntersection, {
      // rootMargin define la "zona activa". 
      // '-120px' arriba compensa el header sticky.
      // '-50%' abajo significa que activamos la sección cuando pasa la mitad de la pantalla.
      rootMargin: '-120px 0px -50% 0px', 
      threshold: 0
    });

    // Observamos todas las secciones
    menu.forEach((cat) => {
      const element = document.getElementById(cat._id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [loading, menu]);


  // Función para scroll suave (Click manual)
  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // Forzamos el estado inmediatamente para feedback instantáneo al click
      setActiveCategory(id);
      setIsMenuOpen(false); 
    }
  };

  // Helper para mostrar el nombre
  const currentCategoryName = menu.find(c => c._id === activeCategory)?.name || 'Menú';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-20 h-20 relative opacity-50">
             <Image src="/Das-Cortez-NoBG.png" alt="Cargando..." fill className="object-contain" />
          </div>
          <p className="font-serif text-stone-600 text-sm tracking-widest uppercase">Preparando el menú...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#1C1C1C] pb-20 flex flex-col">
      
      {/* --- HEADER / LOGO --- */}
      <header className="pt-8 pb-4 text-center max-w-2xl mx-auto">
        <div className="mx-auto w-64 h-32 relative flex items-center justify-center">
            <Image 
              src="/Das-Cortez-NoBG.png" 
              alt="Das Cortez" 
              width={200} 
              height={120} 
              className="object-contain" 
              priority 
            />           
        </div>
      </header>

      {/* --- NAVEGACIÓN HÍBRIDA (Sticky) --- */}
      <div className="sticky top-0 z-50 w-full transition-all duration-300">
        
        {/* 1. VERSIÓN MÓVIL (Hamburguesa) */}
        <div className="md:hidden bg-[#F4F1EA]/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all duration-300">
          <div className="flex justify-between items-center px-4 py-3">
            
            <div className="flex flex-col">
               <span className="text-[0.6rem] uppercase tracking-widest text-stone-400 font-bold">Viendo:</span>
               <span className="font-serif text-lg font-bold text-stone-900 leading-none truncate max-w-50">
                 {currentCategoryName}
               </span>
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-stone-800 focus:outline-none active:scale-95 transition-transform"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>

          {/* Menú Desplegable */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-[#F4F1EA] border-b border-stone-200 shadow-xl flex flex-col max-h-[60vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
              {menu.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => scrollToCategory(cat._id)}
                  className={`
                    w-full text-left px-6 py-4 text-sm font-bold uppercase tracking-widest border-b border-stone-100 last:border-0 hover:bg-white transition-colors
                    ${activeCategory === cat._id ? 'bg-white text-stone-900 border-l-4 border-l-stone-900' : 'text-stone-500'}
                  `}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. VERSIÓN ESCRITORIO (Horizontal) */}
        <div className="hidden md:block bg-[#F4F1EA]/95 backdrop-blur-sm border-b border-stone-200 shadow-sm py-3 mb-8">
          <div className="max-w-5xl mx-auto px-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 justify-start md:justify-center min-w-max px-2">
              {menu.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => scrollToCategory(cat._id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                    activeCategory === cat._id
                      ? 'bg-stone-900 text-[#F4F1EA] border-stone-900 shadow-md transform scale-105'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="max-w-5xl mx-auto px-4 space-y-16 grow pt-4">
        {menu.map((category) => (
          <section key={category._id} id={category._id} className="scroll-mt-32">
            
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-800 shrink-0">
                {category.name}
              </h2>
              <div className="h-px bg-stone-300 w-full opacity-50"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {category.products.map((product) => (
                <article 
                  key={product._id} 
                  className="bg-white p-5 rounded-xl shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all duration-300 flex flex-col justify-between min-h-35"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-lg text-stone-900 font-sans leading-tight">
                        {product.name}
                      </h3>
                      {product.isSeasonal && (
                        <span className="bg-stone-800 text-[#F4F1EA] text-[0.6rem] px-2 py-0.5 rounded uppercase tracking-wider font-bold shrink-0">
                          Temporada
                        </span>
                      )}
                    </div>
                    
                    {product.description && (
                      <p className="text-stone-500 text-sm font-sans leading-snug mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t border-dashed border-stone-100 flex justify-end items-center">
                    
                    {product.drinkType === 'General' && (
                       <span className="text-lg font-bold text-stone-800 font-sans">
                         ${product.price}
                       </span>
                    )}

                    {product.drinkType === 'Frio' && (
                      <div className="flex items-center gap-2 text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
                        <span className="text-xs">❄️ Frío</span>
                        <span className="font-bold text-md">${product.priceCold}</span>
                      </div>
                    )}

                    {product.drinkType === 'Caliente' && (
                      <div className="flex items-center gap-2 text-orange-800 bg-orange-50 px-3 py-1 rounded-full">
                        <span className="text-xs">🔥 Caliente</span>
                        <span className="font-bold text-md">${product.priceHot}</span>
                      </div>
                    )}

                    {product.drinkType === 'Ambos' && (
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end group/hot">
                          <span className="text-[0.6rem] text-stone-400 uppercase tracking-widest font-bold mb-0.5"> Caliente</span>
                          <div className="flex items-center gap-1 text-stone-800">
                             <span className="text-[10px] group-hover/hot:opacity-100 transition-opacity text-orange-500">🔥</span>
                             <span className="font-bold text-lg">${product.priceHot}</span>
                          </div>
                        </div>
                        
                        <div className="w-px h-8 bg-stone-200"></div>
                        
                        <div className="flex flex-col items-end group/cold">
                          <span className="text-[0.6rem] text-stone-400 uppercase tracking-widest font-bold mb-0.5"> Frío</span>
                          <div className="flex items-center gap-1 text-stone-800">
                             <span className="text-[10px] group-hover/cold:opacity-100 transition-opacity text-blue-500">❄️</span>
                             <span className="font-bold text-lg">${product.priceCold}</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* --- FOOTER OPTIMIZADO PARA MÓVIL Y PC --- */}
      <footer className="mt-24 bg-white border-t border-stone-200 py-12 px-4">
        <div className="max-w-md mx-auto text-center space-y-8">
          
          <div className="w-12 h-1 bg-stone-800 mx-auto rounded-full opacity-20"></div>

          <div className="flex justify-center items-center gap-10">
            
            {/* INSTAGRAM */}
            <a 
              href="https://www.instagram.com/dascortezoficial?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 transition-transform hover:scale-110"
            >
              <div className="p-3 bg-stone-50 rounded-full border border-stone-100 group-hover:bg-stone-100 group-hover:border-stone-300 transition-colors shadow-sm">
                <svg className="w-6 h-6 text-stone-600 group-hover:text-stone-900 transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold group-hover:text-stone-800 transition-colors">Síguenos</span>
            </a>

            {/* FACTURACIÓN */}
            <a 
              href={`mailto:facturacion@dascortez.com?subject=${encodeURIComponent("Facturación + (tu número de pedido)")}&body=${encodeURIComponent("Para facturar tu compra, te pedimos nos envíes los siguientes datos:\n\nNombre:\nDirección:\nRFC:\nUso CFDI:")}`}
              className="group flex flex-col items-center gap-2 transition-transform hover:scale-110"
            >
              <div className="p-3 bg-stone-50 rounded-full border border-stone-100 group-hover:bg-stone-100 group-hover:border-stone-300 transition-colors shadow-sm">
                <svg className="w-6 h-6 text-stone-600 group-hover:text-stone-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold group-hover:text-stone-800 transition-colors">Facturación</span>
            </a>

          </div>

          <p className="text-[10px] uppercase tracking-[0.3em] font-sans text-stone-400">
            © {new Date().getFullYear()} Das Cortez
          </p>
        </div>
      </footer>
    </main>
  );
}