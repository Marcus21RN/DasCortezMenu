'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
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
  sizeHot?: string;
  priceCold?: number | null;
  sizeCold?: string; 
  isSeasonal: boolean;
  available: boolean;
}

interface ProductFormProps {
  initialData?: ProductData;
  categories: Category[];
}

export default function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();

  // Estado para controlar el Modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const [formData, setFormData] = useState<ProductData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || (categories[0]?._id || ''),
    drinkType: initialData?.drinkType || 'Ambos',
    price: initialData?.price ?? undefined,
    priceHot: initialData?.priceHot ?? undefined,
    sizeHot: initialData?.sizeHot || '',
    priceCold: initialData?.priceCold ?? undefined,
    sizeCold: initialData?.sizeCold || '',
    isSeasonal: initialData?.isSeasonal || false,
    available: initialData?.available ?? true,
  });

  const selectedCategoryName = categories.find(c => c._id === formData.category)?.name || '';
  
  const isExtras = selectedCategoryName === 'Extras';
  const isColdBrew = selectedCategoryName === 'Cold Brew';
  const isLocked = isExtras || isColdBrew;

  // --- 1. LÓGICA DE DETECCIÓN DE CAMBIOS ---
  const getChanges = () => {
    if (!initialData) return []; 

    const changes: { label: string; oldVal: string; newVal: string }[] = [];
    
    // Mapeo de campos para mostrar etiquetas amigables
    const fields = [
      { key: 'name', label: 'Nombre' },
      { key: 'description', label: 'Descripción' },
      { key: 'category', label: 'Categoría' },
      { key: 'drinkType', label: 'Tipo' },
      { key: 'price', label: 'Precio General' },
      { key: 'priceHot', label: 'Precio Caliente' },
      { key: 'sizeHot', label: 'Medida Caliente' },
      { key: 'priceCold', label: 'Precio Frío' },
      { key: 'sizeCold', label: 'Medida Frío' },
      { key: 'available', label: 'Disponibilidad' },
      { key: 'isSeasonal', label: 'Temporada' },
    ];

    fields.forEach(({ key, label }) => {
      // @ts-expect-error - indexing dynamic key on typed object
      const valOld = initialData[key];
      // @ts-expect-error - indexing dynamic key on typed object
      const valNew = formData[key];

      // Normalizamos para comparar (undefined/null cuentan como igual a vacio o false)
      const strOld = String(valOld ?? '');
      const strNew = String(valNew ?? '');
      // Decidimos si incluimos este campo en la vista de cambios.
      // Siempre incluimos tamaños si el producto inicial ya tenía un valor,
      // para que el modal muestre que el label ya contiene una medida.
      let include = strOld !== strNew;
      if ((key === 'sizeHot' || key === 'sizeCold') && initialData) {
        const hadOld = (initialData[key] ?? '') !== '';
        include = include || hadOld;
      }

      if (include) {
         let oldDisplay = strOld;
         let newDisplay = strNew;

         // Formato legible para booleanos
         if (typeof valNew === 'boolean') {
            oldDisplay = valOld ? 'Sí' : 'No';
            newDisplay = valNew ? 'Sí' : 'No';
         }
         
         // Formato legible para Categorías (ID -> Nombre)
         if (key === 'category') {
             oldDisplay = categories.find(c => c._id === valOld)?.name || '---';
             newDisplay = categories.find(c => c._id === valNew)?.name || '---';
         }

         // Formato para precios
         if (key.includes('price') && valNew) {
            newDisplay = `$${valNew}`;
            oldDisplay = valOld ? `$${valOld}` : '---';
         }

         changes.push({ label, oldVal: oldDisplay, newVal: newDisplay });
      }
    });

    return changes;
  };

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

    // Si el campo es tamaño (sizeHot/sizeCold) queremos almacenar como string con 'oz'
    if ((name === 'sizeHot' || name === 'sizeCold')) {
      // parsed puede venir como number (input type=number) o string; normalizamos
      if (parsed === undefined || parsed === '') {
        parsed = '';
      } else {
        const num = typeof parsed === 'number' ? parsed : Number(String(parsed).replace(/\D/g, ''));
        parsed = Number.isFinite(num) && num > 0 ? `${num}oz` : '';
      }
    }

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
          updated.sizeHot = ''; 
          updated.priceCold = undefined;
          updated.sizeCold = ''; 
        } else if (shouldBeColdBrew) {
          updated.drinkType = 'Frio';
          updated.priceHot = undefined;
          updated.sizeHot = ''; 
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

    setFormData((prev) => {
      const updated = { ...prev, [name]: parsed } as ProductData;
      if (name === 'drinkType') {
        if (value === 'Frio') {
          updated.price = undefined;
        } else if (value === 'Caliente') {
          updated.price = undefined;
        } else if (value === 'Ambos') {
          updated.price = undefined;
        }
      }
      return updated;
    });
  };

  // --- 2. PRE-VALIDACIÓN (Abre el modal) ---
  const handlePreSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validaciones Manuales
    const isNew = !initialData;
    const isValidPrice = (p?: number | null) => p !== undefined && p !== null && p >= 0;

    if (formData.drinkType === 'General') {
      if (isNew) {
        if (!isValidPrice(formData.price)) {
          toast.error('Por favor ingresa un precio único válido');
          return;
        }
      } else {
        const hadPrice = initialData?.price !== undefined && initialData?.price !== null;
        const changedPrice = formData.price !== undefined && formData.price !== null;
        if (hadPrice || changedPrice) {
          if (!isValidPrice(formData.price)) {
            toast.error('Por favor ingresa un precio único válido');
            return;
          }
        }
      }
    } else {
      // Precio caliente
      if (formData.drinkType !== 'Frio') {
        if (isNew) {
          if (!isValidPrice(formData.priceHot)) {
            toast.error('El precio caliente no es válido');
            return;
          }
        } else {
          const hadHot = initialData?.priceHot !== undefined && initialData?.priceHot !== null;
          const changedHot = formData.priceHot !== undefined && formData.priceHot !== null;
          if (hadHot || changedHot) {
            if (!isValidPrice(formData.priceHot)) {
              toast.error('El precio caliente no es válido');
              return;
            }
          }
        }
      }

      // Precio frío
      if (formData.drinkType !== 'Caliente') {
        if (isNew) {
          if (!isValidPrice(formData.priceCold)) {
            toast.error('El precio frío no es válido');
            return;
          }
        } else {
          const hadCold = initialData?.priceCold !== undefined && initialData?.priceCold !== null;
          const changedCold = formData.priceCold !== undefined && formData.priceCold !== null;
          if (hadCold || changedCold) {
            if (!isValidPrice(formData.priceCold)) {
              toast.error('El precio frío no es válido');
              return;
            }
          }
        }
      }
    }

    setShowConfirmation(true);
  };

  // --- 3. GUARDADO FINAL (Lógica original de envío) ---
  const handleFinalSave = async () => {
    setIsSaving(true);
    setShowConfirmation(false);

    const savePromise = async () => {
      const url = initialData?._id 
        ? `/api/products/${initialData._id}` 
        : '/api/products';
      
      const method = initialData?._id ? 'PUT' : 'POST';

      const payload = { ...formData };
      
      // Limpieza final de datos antes de enviar
      if (isExtras) {
        payload.drinkType = 'General';
        payload.priceHot = null;
        payload.sizeHot = '';
        payload.priceCold = null;
        payload.sizeCold = '';
      } else if (isColdBrew) {
        payload.drinkType = 'Frio';
        payload.priceHot = null;
        payload.sizeHot = '';
        payload.price = null;
      } else {
        if (payload.drinkType === 'Frio') {
            payload.priceHot = null;
            payload.sizeHot = '';
            payload.price = null;
        } else if (payload.drinkType === 'Caliente') {
            payload.priceCold = null;
            payload.sizeCold = '';
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

    try {
      await toast.promise(savePromise(), {
        loading: 'Guardando cambios...',
        success: '¡Producto actualizado correctamente!',
        error: (err) => `Error: ${err.toString()}`,
      });
      router.push('/admin');
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const changes = getChanges();

  const isNew = !initialData;
  const needPriceGeneral = isNew || (initialData?.price !== undefined && initialData?.price !== null) || (formData.price !== undefined && formData.price !== null);
  const needPriceHot = formData.drinkType !== 'Frio' && (isNew || (initialData?.priceHot !== undefined && initialData?.priceHot !== null) || (formData.priceHot !== undefined && formData.priceHot !== null));
  const needPriceCold = formData.drinkType !== 'Caliente' && (isNew || (initialData?.priceCold !== undefined && initialData?.priceCold !== null) || (formData.priceCold !== undefined && formData.priceCold !== null));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6 px-1">
        <button
          type="button"
          onClick={() => setShowExitConfirmation(true)}
          className="bg-stone-900 text-[#F4F1EA] px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-stone-700 transition-colors shadow-sm"
        >
          <span className="text-sm">←</span>
          <span>Volver al Dashboard</span>
        </button>
        <h2 className="text-stone-400 text-xs uppercase tracking-widest font-bold">
          {initialData ? 'Editando Producto' : 'Creando Producto'}
        </h2>
      </div>

      <form onSubmit={handlePreSubmit} className="bg-white p-6 md:p-8 shadow-xl rounded-xl border border-stone-200">
        
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
                  disabled={isLocked}
                  className={`w-full p-3 border border-stone-300 rounded-lg outline-none appearance-none ${
                    isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-stone-50 focus:bg-white focus:border-stone-800'
                  }`}
                >
                  <option value="Ambos">Ambos (C/F)</option>
                  <option value="Caliente">Solo Caliente</option>
                  <option value="Frio">Solo Frío</option>
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

          {/* SECCIÓN DE PRECIOS Y MEDIDAS */}
<div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
              <h3 className="text-xs font-bold text-stone-400 uppercase mb-4 tracking-widest border-b border-stone-200 pb-2">Configuración de Precios y Medidas</h3>
              
              {formData.drinkType === 'General' ? (
                  <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Único $</label>
                      <div className="relative">
                            <input
                              type="number"
                              name="price"
                              min={0}
                              step={0.5}
                              required={needPriceGeneral}
                              value={formData.price ?? ''}
                              onChange={handleChange}
                              className="w-full p-3 pl-9 border border-stone-300 rounded-lg focus:border-stone-800 outline-none invalid:border-red-400 focus:invalid:ring-red-200"
                              placeholder="0.00"
                            />
                      </div>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* CALIENTE */}
                      <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                          <div className="mb-2 flex items-center justify-between">
                             <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                                <span>🔥 Caliente</span>
                             </label>
                             {formData.drinkType === 'Frio' && <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">(Desactivado)</span>}
                          </div>
                          
                          <div className="flex gap-2">
                              {/* Precio */}
                                <div className="relative w-3/5">
                                  <label className="text-sm font-bold text-stone-400 uppercase mb-1 block text-left">Precio $</label>
                                  <div className="relative">
                                      <input
                                          type="number"
                                          name="priceHot"
                                          min={0}
                                          step={0.5}
                                          disabled={formData.drinkType === 'Frio'}
                                          required={needPriceHot}
                                      value={formData.drinkType === 'Frio' ? '' : (formData.priceHot ?? '')}
                                          onChange={handleChange}
                                          placeholder="0.00"
                                      className={`w-full p-3 border rounded text-sm outline-none transition-colors invalid:border-red-400 ${
                                            formData.drinkType === 'Frio' 
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                            : 'bg-white border-stone-300 focus:border-orange-400'
                                          }`}
                                      />
                                  </div>
                              </div>
                                {/* Medida */}
                                <div className="w-2/5">
                                  <label className="text-sm font-bold text-stone-400 uppercase mb-1 block text-center">OZ</label>
                                  <div className="flex items-center justify-center gap-2">
                                    <input
                                      type="number"
                                      name="sizeHot"
                                      min={1}
                                      step={1}
                                      disabled={formData.drinkType === 'Frio'}
                                      value={formData.drinkType === 'Frio' ? '' : (formData.sizeHot ? formData.sizeHot.replace(/\D/g, '') : '')}
                                      onChange={handleChange}
                                      placeholder="Oz"
                                      className={`w-full p-3 border rounded text-base text-center outline-none transition-colors ${
                                      formData.drinkType === 'Frio' 
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                      : 'bg-white border-stone-300 focus:border-orange-400'
                                      }`}
                                    />
                                    <span className="text-sm text-stone-400">oz</span>
                                  </div>
                                </div>
                          </div>
                      </div>

                      {/* FRÍO */}
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                          <div className="mb-2 flex items-center justify-between">
                             <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1">
                                <span>❄️ Frío</span>
                             </label>
                             {formData.drinkType === 'Caliente' && <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">(Desactivado)</span>}
                          </div>

                          <div className="flex gap-2">
                              {/* Precio */}
                              <div className="relative w-3/5">
                                  <label className="text-sm font-bold text-stone-400 uppercase mb-1 block text-left">Precio $</label>
                                  <div className="relative">
                                      
                                      <input
                                          type="number"
                                          name="priceCold"
                                          min={0}
                                          disabled={formData.drinkType === 'Caliente'}
                                          required={needPriceCold}
                                          value={formData.drinkType === 'Caliente' ? '' : (formData.priceCold ?? '')}
                                          onChange={handleChange}
                                          placeholder="0.00"
                                          className={`w-full p-3 border rounded text-sm outline-none transition-colors invalid:border-red-400 ${
                                            formData.drinkType === 'Caliente' 
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                            : 'bg-white border-stone-300 focus:border-blue-400'
                                          }`}
                                      />
                                  </div>
                              </div>
                              {/* Medida */}
                                <div className="w-2/5">
                                  <label className="text-sm font-bold text-stone-400 uppercase mb-1 block text-center">OZ</label>
                                  <div className="flex items-center justify-center gap-2">
                                    <input
                                      type="number"
                                      name="sizeCold"
                                      min={1}
                                      step={1}
                                      disabled={formData.drinkType === 'Caliente'}
                                      value={formData.drinkType === 'Caliente' ? '' : (formData.sizeCold ? formData.sizeCold.replace(/\D/g, '') : '')}
                                      onChange={handleChange}
                                      placeholder="Oz"
                                      className={`w-full p-3 border rounded text-base text-center outline-none transition-colors ${
                                      formData.drinkType === 'Caliente' 
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                      : 'bg-white border-stone-300 focus:border-blue-400'
                                      }`}
                                    />
                                    <span className="text-sm text-stone-400">oz</span>
                                  </div>
                                </div>
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
            disabled={isSaving}
            className="w-full bg-stone-900 text-[#F4F1EA] font-bold py-4 rounded-lg hover:bg-stone-700 active:scale-[0.99] transition-all uppercase tracking-widest shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialData ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
        </div>
      </form>

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-100">
              <h3 className="font-serif text-xl font-bold text-stone-800">
                {initialData ? '¿Confirmar cambios?' : '¿Crear nuevo producto?'}
              </h3>
              <p className="font-serif text-xs text-stone-500 mt-1">
                Por favor verifica la información antes de guardar.
              </p>
            </div>

            {/* Body Modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {initialData ? (
                 // MODO EDICIÓN: Diff View
                 changes.length > 0 ? (
                    <div className="space-y-4">
                      {changes.map((change, idx) => (
                        <div key={idx} className="font-serif text-sm border-b border-dashed border-stone-300 pb-2 last:border-0">
                          <p className="text-center font-bold text-stone-400 uppercase tracking-wider mb-1">
                            {change.label}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                             <span className="font-serif line-through decoration-red-400/50 decoration-2 text-xs">
                               {change.oldVal || '(Vacío)'}
                             </span>
                             <span className="text-green-600"> ➙➙ </span>
                             <span className="font-serif px-2 py-0.5 rounded text-sm">
                               {change.newVal}
                             </span>
                          </div>
                        </div>
                      ))}
                    </div>
                 ) : (
                    <div className="text-center py-4">
                        <p className="font-serif text-stone-500">No detectamos cambios en el formulario.</p>
                        <p className="font-serif text-xs text-stone-400 mt-1">¿Quizás olvidaste modificar algo?</p>
                    </div>
                 )
              ) : (
                 // MODO CREACIÓN: Resumen Simple
                 <div className="space-y-2">
                    <p className="font-seriftext-stone-600">
                      Vas a crear el producto <span className="font-bold text-stone-900">&quot;{formData.name}&quot;</span> en la categoría <span className="font-bold text-stone-900">{selectedCategoryName}</span>.
                    </p>
                 </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 rounded border border-stone-300 text-stone-600 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors"
              >
                Cancelar / Editar
              </button>
              
              <button
                onClick={handleFinalSave}
                disabled={isSaving || (!!initialData && changes.length === 0)}
                className="bg-stone-900 hover:bg-stone-700 text-[#F4F1EA] px-6 py-2 rounded font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE SALIDA --- */}
      {showExitConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">

            <div className="bg-stone-50 px-6 py-4 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-stone-800">Dejarás de editar el producto</h3>
              <p className="text-xs text-stone-500 mt-1">
                {changes.length > 0 ? (
                  <>
                    Hay cambios no guardados ({changes.length}). Si continúas, se perderán.
                  </>
                ) : (
                  '¿Seguro que quieres volver al Dashboard?'
                )}
              </p>
            </div>

            <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
              <button
                onClick={() => setShowExitConfirmation(false)}
                className="px-4 py-2 rounded border border-stone-300 text-stone-600 font-bold text-xs uppercase tracking-wider hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={() => { setShowExitConfirmation(false); router.push('/admin'); }}
                className="bg-stone-900 hover:bg-stone-700 text-[#F4F1EA] px-6 py-2 rounded font-bold text-xs uppercase tracking-wider shadow-md transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}