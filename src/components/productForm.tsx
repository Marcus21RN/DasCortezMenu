'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
}

interface ProductData {
  _id?: string;
  name: string;
  description?: string;
  category: string;
  drinkType: 'Caliente' | 'Frio' | 'Ambos' | 'General';
  price?: number | null;
  priceHot?: number | null;
  priceCold?: number | null;
  isSeasonal: boolean;
  available: boolean;
}

interface ProductFormProps {
  initialData?: ProductData;
  categories: Category[];
}

export default function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<ProductData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || (categories[0]?._id || ''),
    drinkType: initialData?.drinkType || 'Ambos',
    price: initialData?.price ?? undefined,
    priceHot: initialData?.priceHot ?? undefined,
    priceCold: initialData?.priceCold ?? undefined,
    isSeasonal: initialData?.isSeasonal || false,
    available: initialData?.available ?? true,
  });

  const selectedCategoryName = categories.find(c => c._id === formData.category)?.name || '';
  
  const isExtras = selectedCategoryName === 'Extras';
  const isColdBrew = selectedCategoryName === 'Cold Brew';
  const isLocked = isExtras || isColdBrew;

  // Limpieza automática ahora se aplica al cambiar la categoría dentro de handleChange
  // (Evita setState síncrono dentro de useEffect para prevenir renders en cascada)
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;
    
    let parsed: string | number | boolean | undefined = isCheckbox ? checked : value;
    
    if (type === 'number') {
      parsed = value === '' ? undefined : Number(value);
    }

    // Si cambiamos la categoría, calculamos sus reglas locales antes de aplicar el setFormData
    if (name === 'category') {
      const newCategoryId = String(parsed);
      const newCategoryName = categories.find(c => c._id === newCategoryId)?.name || '';
      const shouldBeExtras = newCategoryName === 'Extras';
      const shouldBeColdBrew = newCategoryName === 'Cold Brew';

      setFormData((prev) => {
        const updated = { ...prev, [name]: parsed } as ProductData;

        if (shouldBeExtras) {
          updated.drinkType = 'General';
          updated.priceHot = undefined;
          updated.priceCold = undefined;
        } else if (shouldBeColdBrew) {
          updated.drinkType = 'Frio';
          updated.priceHot = undefined;
          updated.price = undefined;
        } else {
          if (updated.drinkType === 'General') {
            updated.drinkType = 'Ambos';
            updated.price = undefined;
          }
        }

        return updated;
      });

      return;
    }

    // Actualizamos el estado para otros campos
    setFormData((prev) => {
      const updated = { ...prev, [name]: parsed } as ProductData;

      // Limpieza en tiempo real al cambiar tipos manualmente (para categorías no bloqueadas)
      if (name === 'drinkType') {
        if (value === 'Frio') {
          updated.priceHot = undefined;
          updated.price = undefined;
        } else if (value === 'Caliente') {
          updated.priceCold = undefined;
          updated.price = undefined;
        } else if (value === 'Ambos') {
          updated.price = undefined;
        }
      }

      return updated;
    });
  };

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

if (formData.drinkType === 'General') {
       if (formData.price === undefined || formData.price === null || formData.price < 0) {
          toast.error('Por favor ingresa un precio único válido');
          return;
       }
    } else {
       if (formData.drinkType !== 'Frio') {
         if (formData.priceHot === undefined || formData.priceHot === null || formData.priceHot < 0) {
            toast.error('El precio caliente no es válido');
            return;
         }
       }
       if (formData.drinkType !== 'Caliente') {
         if (formData.priceCold === undefined || formData.priceCold === null || formData.priceCold < 0) {
            toast.error('El precio frío no es válido');
            return;
         }
       }
    }

    const savePromise = async () => {
      const url = initialData?._id 
        ? `/api/products/${initialData._id}` 
        : '/api/products';
      
      const method = initialData?._id ? 'PUT' : 'POST';

      const payload = { ...formData };
      
      if (isExtras) {
        payload.drinkType = 'General';
        payload.priceHot = null;
        payload.priceCold = null;
      } else if (isColdBrew) {
        payload.drinkType = 'Frio';
        payload.priceHot = null;
        payload.price = null;
      } else {
        if (payload.drinkType === 'Frio') {
            payload.priceHot = null;
            payload.price = null;
        } else if (payload.drinkType === 'Caliente') {
            payload.priceCold = null;
            payload.price = null;
        } else {
            payload.price = null;
        }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      
      return data;
    };

    await toast.promise(savePromise(), {
      loading: 'Guardando cambios...',
      success: '¡Producto actualizado correctamente!',
      error: (err) => `Error: ${err.toString()}`,
    });

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6 px-1">
        <button 
          type="button"
          onClick={() => router.push('/admin')}
          className="text-stone-500 hover:text-stone-800 font-bold text-sm flex items-center gap-2 transition-colors"
        >
          ← Volver al Dashboard
        </button>
        <h2 className="text-stone-400 text-xs uppercase tracking-widest font-bold">
          {initialData ? 'Editando Producto' : 'Creando Producto'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 shadow-xl rounded-xl border border-stone-200">
        <div className="space-y-6">
        
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1 ml-1">Nombre del Producto</label>
            <input
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none transition-all invalid:border-red-400"
              placeholder="Ej. Latte Vainilla"
            />
          </div>

          {/* GRID CATEGORÍA Y TIPO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1 ml-1">Categoría</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:border-stone-800 outline-none appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-600">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1 ml-1">Tipo de Producto</label>
              <div className="relative">
                <select
                  name="drinkType"
                  value={formData.drinkType}
                  onChange={handleChange}
                  // Se bloquea si es Extras o Cold Brew
                  disabled={isLocked}
                  className={`w-full p-3 border border-stone-300 rounded-lg outline-none appearance-none ${
                    isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-stone-50 focus:bg-white focus:border-stone-800'
                  }`}
                >
                  <option value="Ambos">Ambos (C/F)</option>
                  <option value="Caliente">Solo Caliente</option>
                  <option value="Frio">Solo Frío</option>
                  
                  {/* Opción General SOLO visible si es Extras */}
                  {isExtras && <option value="General">General / Extra</option>}
                </select>
                {!isLocked && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-600">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                )}
              </div>
              {isLocked && (
                <p className="text-[10px] text-stone-400 mt-1 ml-1">
                  * Configuración automática por categoría
                </p>
              )}
            </div>
          </div>

          {/* SECCIÓN DE PRECIOS */}
          <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
              <h3 className="text-xs font-bold text-stone-400 uppercase mb-4 tracking-widest border-b border-stone-200 pb-2">Configuración de Precios</h3>
              
              {formData.drinkType === 'General' ? (
                  <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Único</label>
                      <div className="relative">
                          <span className="absolute left-3 top-3 text-stone-400 font-bold">$</span>
                          <input
                              type="number"
                              name="price"
                              min={0}
                              step={0.5}
                              required
                              value={formData.price ?? ''}
                              onChange={handleChange}
                              className="w-full p-3 pl-8 border border-stone-300 rounded-lg focus:border-stone-800 outline-none invalid:border-red-400 focus:invalid:ring-red-200"
                              placeholder="0.00"
                          />
                      </div>
                  </div>
              ) : (
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Caliente 🔥</label>
                          <div className="relative">
                              <span className="absolute left-3 top-3 text-stone-400 font-bold">$</span>
                              <input
                                  type="number"
                                  name="priceHot"
                                  min={0}
                                  step={0.5}
                                  // Deshabilitado si el tipo es Frío
                                  disabled={formData.drinkType === 'Frio'}
                                  required={formData.drinkType !== 'Frio'}
                                  // TRUCO VISUAL: Si está deshabilitado, mostramos vacío aunque haya dato sucio
                                  value={formData.drinkType === 'Frio' ? '' : (formData.priceHot ?? '')}
                                  onChange={handleChange}
                                  className={`w-full p-3 pl-8 border rounded-lg outline-none transition-colors invalid:border-red-400 ${
                                      formData.drinkType === 'Frio' 
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                      : 'bg-white border-stone-300 focus:border-stone-800'
                                  }`}
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Frío ❄️</label>
                          <div className="relative">
                              <span className="absolute left-3 top-3 text-stone-400 font-bold">$</span>
                              <input
                                  type="number"
                                  name="priceCold"
                                  min={0}
                                  step={0.5}
                                  disabled={formData.drinkType === 'Caliente'}
                                  required={formData.drinkType !== 'Caliente'}
                                  value={formData.drinkType === 'Caliente' ? '' : (formData.priceCold ?? '')}
                                  onChange={handleChange}
                                  className={`w-full p-3 pl-8 border rounded-lg outline-none transition-colors invalid:border-red-400 ${
                                      formData.drinkType === 'Caliente' 
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                      : 'bg-white border-stone-300 focus:border-stone-800'
                                  }`}
                              />
                          </div>
                      </div>
                  </div>
              )}
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1 ml-1">Descripción (Opcional)</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:border-stone-800 outline-none transition-all"
              placeholder="Ingredientes, notas de sabor..."
            />
          </div>

          {/* SWITCHES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center justify-between p-4 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
              <span className="text-sm font-bold text-stone-700"> Es de Temporada</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isSeasonal" 
                  checked={formData.isSeasonal} 
                  onChange={handleChange} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-stone-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-800"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
              <span className="text-sm font-bold text-stone-700"> Disponible / Activo</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="available" 
                  checked={formData.available} 
                  onChange={handleChange} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 text-[#F4F1EA] font-bold py-4 rounded-lg hover:bg-stone-700 active:scale-[0.99] transition-all uppercase tracking-widest shadow-lg mt-4"
          >
            {initialData ? 'Actualizar Producto' : 'Crear Producto'}
          </button>

        </div>
      </form>
    </div>
  );
}