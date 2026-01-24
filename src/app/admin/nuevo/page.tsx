import dbConnect from '@/lib/dbConnect';
import Category from '@/models/category';
import ProductForm from '@/components/productForm';

// Función para limpiar datos de Mongo
const serializeData = <T,>(data: T): T => {
  return JSON.parse(JSON.stringify(data)) as T;
};

export default async function NewProductPage() {
  await dbConnect();

  // Obtenemos las categorías directamente del servidor
  const categoriesDoc = await Category.find({}).lean();
  const categories = serializeData(categoriesDoc);

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-stone-800 mb-6 px-1">
        Nuevo Producto
      </h1>
      {/* Pasamos las categorías al formulario. initialData va vacío porque es nuevo. */}
      <ProductForm categories={categories} />
    </div>
  );
}