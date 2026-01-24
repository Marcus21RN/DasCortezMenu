import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
// Importamos Category para que el populate funcione correctamente internamente
import Category from '@/models/category'; 
import AdminView from '@/components/adminView';

// Esto asegura que la página del admin siempre tenga datos frescos al recargar
export const dynamic = 'force-dynamic';

async function getData() {
  await dbConnect();

  // Obtenemos los productos directo de la BD
  const products = await Product.find({})
    .populate('category', 'name') // Traemos el nombre de la categoría
    .sort({ category: 1 })      // Ordenamos por los más recientes
    .lean();                      // Convertimos a objetos planos de JS para mejor rendimiento

  // Serializamos (convertimos a string y luego a JSON) para evitar errores
  // de paso de datos entre Servidor y Cliente (por los ObjectIds de Mongo)
  return JSON.parse(JSON.stringify(products));
}

export default async function AdminPage() {
  const products = await getData();

  return (
    <AdminView initialProducts={products} />
  );
}