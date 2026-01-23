import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import { getToken } from 'next-auth/jwt';

// GET: Obtener UN producto para editarlo
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  return NextResponse.json(product);
}

// PUT: Actualizar producto
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    const { id } = await params;
    const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updatedProduct) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar producto';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE: Borrar producto
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar producto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}