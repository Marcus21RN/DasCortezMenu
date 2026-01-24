import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import Category from '@/models/category'; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { productSchema } from "@/lib/validations";

// --- GET: OBTENER TODOS LOS PRODUCTOS (ADMIN) ---
export async function GET() { 
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    await dbConnect();

    // FILTRADO DE DATOS SENSIBLES
    const products = await Product.find({})
      .populate('category', 'name') 
      .select('-__v -updatedAt')
      .sort({ category: 1 });

    return NextResponse.json(products);
  } catch (error) {
    // ERROR GENÉRICO
    console.error("Error GET products:", error);
    return NextResponse.json({ error: 'Error al obtener el inventario' }, { status: 500 });
  }
}

// --- POST: CREAR PRODUCTO (ADMIN) ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();

    // VALIDACIÓN PREVIA CON ZOD
        const validation = productSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json({ error: 'Datos inválidos', details: validation.error.issues }, { status: 400 });
        }

    await dbConnect();
    

    const newProduct = await Product.create(validation.data);
  
    const responseProduct = newProduct.toObject();
    delete responseProduct.__v;

    return NextResponse.json(responseProduct, { status: 201 });
  } catch (error) {
    console.error("Error POST product:", error);
    return NextResponse.json({ error: 'No se pudo crear el producto' }, { status: 500 });
  }
}