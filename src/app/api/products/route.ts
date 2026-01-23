import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import Category from '@/models/category'; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// --- GET: OBTENER TODOS LOS PRODUCTOS (ADMIN) ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    const products = await Product.find({})
      .populate('category');

    return NextResponse.json(products);
  } catch (error: unknown) { 
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

// --- POST: CREAR PRODUCTO ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    
    const newProduct = await Product.create(body);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    
    // Extracción segura del mensaje de error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear producto';
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}