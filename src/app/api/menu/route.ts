import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import Category from '@/models/category';
import { ca } from 'zod/locales';

// CAMBIO 1: Reemplazamos 'force-dynamic' por revalidación por tiempo
// Esto cachea la respuesta por 60 segundos (ISR)
export const revalidate = 60; 

export async function GET() {
  try {
    await dbConnect();

    Category;

    // CAMBIO 2: Usamos .lean() para consultas de solo lectura (más rápido)
    const products = await Product.find({ available: true })
      .populate('category', 'name slug')
      .lean() // .lean() devuelve objetos JS puros, no documentos pesados de Mongoose
      .sort({ category: 1 });

    type MenuProduct = {
      _id?: string;
      name?: string;
      price?: number;
      available?: boolean;
      category?: {
        _id?: string;
        name?: string;
        slug?: string;
      } | null;
      [key: string]: unknown;
    };

    type CategoryGroup = {
      _id?: string | null;
      name: string;
      slug: string;
      products: MenuProduct[];
    };

    const grouped = products.reduce<Record<string, CategoryGroup>>((acc, product: MenuProduct) => {
      const catName = (product.category?.name as string) || 'Otros';
      const catSlug = (product.category?.slug as string) || 'otros';
      const catId = product.category?._id?.toString();

      if (!acc[catName]) {
        acc[catName] = {
          _id: catId,
          name: catName,
          slug: catSlug,
          products: [],
        };
      }
      acc[catName].products.push(product);
      return acc;
    }, {});

    // Ordenar categorías (Opcional: podrías definir un orden fijo si quisieras)
    const response = (Object.values(grouped) as CategoryGroup[])
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al cargar menú' }, { status: 500 });
  }
}