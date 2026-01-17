import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product.ts';
import Category from '@/models/category.ts';

// Esta instrucción evita que Next.js cachee la respuesta estáticamente en el build.
// Queremos datos frescos de la BD cada vez (o al menos que se revaliden).
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Conectamos a la BD
    await dbConnect();

    // 2. Traemos todas las categorías ordenadas por el campo 'order' (1, 2, 3...)
    const categories = await Category.find({}).lean();

    // 3. Traemos TODOS los productos activos
    // Usamos .lean() para obtener objetos JSON puros (más rápido que objetos Mongoose completos)
    const products = await Product.find({ available: true }).lean();

    // 4. "Armamos" el menú (Lógica del Controlador)
    // Cruzamos los datos: A cada categoría le inyectamos sus productos correspondientes.
    const menuData = categories.map((category) => {
      // Filtramos los productos que pertenecen a esta categoría
      const categoryProducts = products.filter(
        (product) => product.category.toString() === category._id.toString()
      );

      return {
        ...category,       // Datos de la categoría (nombre, slug)
        products: categoryProducts, // Array con sus productos
      };
    });

    // 5. Retornamos el JSON estructurado
    return NextResponse.json(menuData);

  } catch (error) {
    console.error('Error al obtener el menú:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al cargar el menú' },
      { status: 500 }
    );
  }
}