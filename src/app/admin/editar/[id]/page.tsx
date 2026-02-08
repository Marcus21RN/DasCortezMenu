import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import Category from '@/models/category';
import ProductForm from '@/components/productForm';
import { notFound } from 'next/navigation';
import type { IProduct } from '@/models/product';
import type { ICategory } from '@/models/category';

const serializeData = <T,>(data: T): T => {
  return JSON.parse(JSON.stringify(data)) as T;
};

// CAMBIO 1: Definimos el tipo como una Promesa
interface Props {
  params: Promise<{ id: string }>;
}

// Tipo local que refleja la forma que espera `ProductForm` (definido en el componente)
type ProductFormData = {
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
};

export default async function EditProductPage({ params }: Props) {
  await dbConnect();

  // CAMBIO 2: Desempaquetamos (await) los params antes de usarlos
  const { id } = await params;

  let product: ProductFormData | undefined;
  let categories: { _id: string; name: string }[] = [];
  try {
    // Usamos 'id' directamente (ya no params.id)
    const [productDoc, categoriesDoc] = await Promise.all([
      Product.findById(id).lean(),
      Category.find({}).lean(),
    ]);

    if (!productDoc) {
      return notFound();
    }

    // Normalizamos datos serializables
    const rawProduct = serializeData(productDoc) as unknown as IProduct & { _id?: unknown; category?: unknown };
    const rawCategories = serializeData(categoriesDoc) as unknown as ICategory[];

    // Mapear a la forma que espera ProductForm (asegurando types)
    product = {
      _id: rawProduct._id ? String(rawProduct._id) : undefined,
      name: rawProduct.name,
      description: rawProduct.description,
      category: rawProduct.category ? String(rawProduct.category) : '',
      drinkType: rawProduct.drinkType as ProductFormData['drinkType'],
      price: rawProduct.price ?? undefined,
      priceHot: rawProduct.priceHot ?? undefined,
      sizeHot: rawProduct.sizeHot ?? '',
      priceCold: rawProduct.priceCold ?? undefined,
      sizeCold: rawProduct.sizeCold ?? '',
      isSeasonal: rawProduct.isSeasonal ?? false,
      available: rawProduct.available ?? true,
    };

    categories = rawCategories.map((c) => ({ _id: c._id ? String(c._id) : '', name: c.name }));
  } catch (error) {
    console.error("Error en Edit Page:", error);
    return <div>Error al cargar el producto.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-stone-800 mb-6 px-1">
        Editar Producto
      </h1>
      <ProductForm initialData={product} categories={categories} />
    </div>
  );
}