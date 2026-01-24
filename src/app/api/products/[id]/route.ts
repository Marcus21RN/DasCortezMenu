import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { productSchema } from "@/lib/validations"; // Importamos Zod

// --- GET: OBTENER UN PRODUCTO (PROTEGIDO) ---
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. PROTECCIÓN DE SESIÓN
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    // 2. FILTRADO DE DATOS (DTO)
    const product = await Product.findById(id).select('-__v -createdAt -updatedAt');

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    // 3. MANEJO DE ERRORES SEGURO
    console.error("Error interno GET product:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// --- PUT: ACTUALIZAR PRODUCTO (PROTEGIDO + VALIDADO) ---
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();

    // 4. VALIDACIÓN CON ZOD (Antes de tocar la BD)
    const validation = productSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: validation.error.issues }, { status: 400 });
    }

    await dbConnect();

    const { id } = await params;

    // Actualizamos usando los datos ya "limpios" de validation.data
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      validation.data,
      { new: true, runValidators: true }
    ).select('-__v'); // Filtramos salida
    
    if (!updatedProduct) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error interno PUT product:", error);
    return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 500 });
  }
}
