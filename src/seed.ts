import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno (.env.local) antes de importar módulos que las usan
dotenv.config({ path: '.env.local' });

const seedData = async () => {
  try {
    // Importar dinámicamente después de cargar las variables de entorno
    const { default: dbConnect } = await import('./lib/dbConnect.ts');
    const { default: Category } = await import('./models/category.ts');
    const { default: Product } = await import('./models/product.ts');

    // 1. Conectar a la Base de Datos
    await dbConnect();
    console.log('🌱 Conectado a MongoDB...');

    // 2. Limpiar la base de datos (Borrar datos viejos) — prevenir duplicados
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🧹 Base de datos limpiada.');

    // 3. Crear Categorías (Basado en tu imagen)
    // Guardamos las referencias para usarlas al crear productos
    const categories = await Category.insertMany([
      { name: 'Especialidades', slug: 'especialidades' },
      { name: 'Bebidas a base de Espresso', slug: 'espresso' },
      { name: 'Cold Brew', slug: 'cold-brew' },
      { name: 'Tés y Tisanas', slug: 'tes-tisanas' },
      { name: 'Extras', slug: 'extras' },
    ]);

    // Mapa auxiliar para encontrar el ID de la categoría por nombre rápido
    const catMap = categories.reduce<Record<string, mongoose.Types.ObjectId>>(
      (acc, cat: { name: string; _id: mongoose.Types.ObjectId }) => {
        acc[cat.name] = cat._id;
        return acc;
      },
      {} as Record<string, mongoose.Types.ObjectId>
    );

    // 4. Crear Productos (Datos reales de la imagen "Das Cortez")
    const products = [
      // --- ESPECIALIDADES (Mayormente frías según imagen) ---
      {
        name: 'Segafredo',
        description: 'Espresso doble endulzado y agitado con hielo. Agrega leche por $20.',
        category: catMap['Especialidades'],
        drinkType: 'Frio',
        priceCold: 75,
        available: true,
      },
      {
        name: 'Affogato',
        description: 'Nieve artesanal de vainilla, espresso doble o sencillo.',
        category: catMap['Especialidades'],
        drinkType: 'Frio',
        priceCold: 90,
        available: true,
      },
      {
        name: 'Espresso Tonic',
        description: 'Bebida fría a base de agua tónica, espresso doble y decoración de toronja.',
        category: catMap['Especialidades'],
        drinkType: 'Frio',
        priceCold: 90,
        available: true,
      },

      // --- BEBIDAS A BASE DE ESPRESSO (Precios dobles) ---
      {
        name: 'Espresso',
        category: catMap['Bebidas a base de Espresso'],
        drinkType: 'Ambos',
        priceHot: 45,
        priceCold: 50,
        available: true,
      },
      {
        name: 'Macchiato',
        category: catMap['Bebidas a base de Espresso'],
        drinkType: 'Ambos', // Asumo ambos por la columna, aunque en imagen se ve solo precio izq a veces
        priceHot: 45,
        priceCold: 50,
        available: true,
      },
      {
        name: 'Espresso Americano',
        category: catMap['Bebidas a base de Espresso'],
        drinkType: 'Ambos',
        priceHot: 45,
        priceCold: 50,
        available: true,
      },
      {
        name: 'Cappuccino Italiano',
        category: catMap['Bebidas a base de Espresso'],
        drinkType: 'Ambos',
        priceHot: 55,
        priceCold: 60,
        available: true,
      },
      {
        name: 'Latte',
        category: catMap['Bebidas a base de Espresso'],
        drinkType: 'Ambos',
        priceHot: 55,
        priceCold: 60,
        available: true,
      },
      {
        name: 'Café de Olla',
        category: catMap['Bebidas a base de Espresso'],
        drinkType: 'Ambos',
        priceHot: 45,
        priceCold: 50,
        isSeasonal: true, // Ejemplo de uso
        available: true,
      },

      // --- COLD BREW ---
      {
        name: 'Cold Brew',
        category: catMap['Cold Brew'],
        drinkType: 'Frio',
        priceCold: 75, // Precio base inferido
        available: true,
      },
      {
        name: 'Cold Brew con Crema Fría',
        category: catMap['Cold Brew'],
        drinkType: 'Frio',
        priceCold: 96,
        available: true,
      },

      // --- TÉS Y TISANAS ---
      {
        name: 'Tisana',
        description: 'Fresa Kiwi, flamenco o moras carmesí.',
        category: catMap['Tés y Tisanas'],
        drinkType: 'Ambos',
        priceHot: 75,
        priceCold: 80, // Precios aproximados basados en la columna derecha de la imagen
        available: true,
      },
      {
        name: 'Chai Latte',
        description: 'Infusión de té chai masala especiado.',
        category: catMap['Tés y Tisanas'],
        drinkType: 'Ambos',
        priceHot: 85,
        priceCold: 90,
        available: true,
      },
      {
        name: 'Matcha Latte',
        category: catMap['Tés y Tisanas'],
        drinkType: 'Ambos',
        priceHot: 85,
        priceCold: 90,
        available: true,
      },

      // --- EXTRAS ---
      {
        name: 'Jarabe',
        description: 'Vainilla, lavanda, caramelo, yerbabuena.',
        category: catMap['Extras'],
        drinkType: 'General',
        price: 20, // Precio único para Extras
        available: true,
      },
      {
        name: 'Shot Adicional de Espresso',
        category: catMap['Extras'],
        drinkType: 'General',
        price: 15,
        available: true,
      },
      {
        name: 'Cambio a Leche Vegetal',
        category: catMap['Extras'],
        drinkType: 'General',
        price: 25, // Precio promedio de las leches vegetales en la lista
        available: true,
      }
    ];

    await Product.insertMany(products);
    console.log(`✅ ¡Éxito! Se insertaron ${categories.length} categorías y ${products.length} productos.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar datos:', error);
    process.exit(1);
  }
};

seedData();