"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/productForm';

// 1. Definimos qué forma tiene una Categoría que viene de la API
interface ApiCategory {
  _id: string;
  name: string;
}

// 2. Definimos la forma del producto para el estado initialData
interface ProductData {
  _id: string;
  name: string;
  description?: string;
  category: string; // El ID de la categoría
  drinkType: 'Caliente' | 'Frio' | 'Ambos' | 'General';
  price?: number;
  priceHot?: number;
  priceCold?: number;
  isSeasonal: boolean;
  available: boolean;
}

// 3. Definimos la categoría simplificada para el select
interface SimpleCategory {
  _id: string;
  name: string;
}

export default function EditProductPage() {
  // useParams puede devolver string o array, forzamos a string para evitar errores
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : undefined;

  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  
  // AQUI EL CAMBIO: Ya no es <any>, ahora es <ProductData | null>
  const [initialData, setInitialData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/menu'),
        ]);

        if (!prodRes.ok || !catRes.ok) throw new Error("Error al cargar datos");

        const prod: ProductData = await prodRes.json();
        const cats: ApiCategory[] = await catRes.json(); // Tipamos la respuesta

        setInitialData(prod);
        
        // AQUI EL CAMBIO: 'c' ahora es de tipo ApiCategory, ya no necesitamos 'any'
        setCategories(cats.map((c) => ({ _id: c._id, name: c.name })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (!id) return <div className="p-8 text-center text-red-600">ID de producto inválido</div>;
  if (loading) return <div className="p-8 text-center text-stone-600">Cargando datos...</div>;

  // Renderizado condicional: Solo mostramos el form si tenemos datos
  return initialData ? (
    <ProductForm initialData={initialData} categories={categories} />
  ) : (
    <div className="p-8 text-center text-red-600">No se encontró el producto</div>
  );
}