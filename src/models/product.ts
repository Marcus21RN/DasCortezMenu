import mongoose, { Schema, model, models } from 'mongoose';

// 1. Definimos las Categorías exactas de tu menú para evitar errores de dedo
export const CATEGORIES = [
  'Especialidades',
  'Bebidas a base de Espresso',
  'Cold Brew',
  'Tés y Tisanas',
  'Extras'
] as const;

// 2. Definimos los tipos de bebida (para saber qué precios mostrar)
export const DRINK_TYPES = ['Caliente', 'Frio', 'Ambos', 'Comida/General'] as const;

// 3. Interfaz de TypeScript (Ayuda a tu editor de código a autocompletar)
export interface IProduct {
  _id?: string;
  name: string;
  description?: string;
  category: typeof CATEGORIES[number];
  drinkType: typeof DRINK_TYPES[number];
  priceHot?: number;  // Precio columna izquierda (o única si es general)
  priceCold?: number; // Precio columna derecha
  isSeasonal: boolean; // Para "Productos de temporada"
  available: boolean; // Para "apagar" un producto si se agota sin borrarlo
  image?: string;     // URL de la imagen (opcional para futuro)
}

// 4. El Esquema de Mongoose (La reglas para la Base de Datos)
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: CATEGORIES, // Solo permite las categorías de tu lista
    },
    drinkType: {
      type: String,
      required: true,
      enum: DRINK_TYPES,
      default: 'Ambos'
    },
    // Manejo inteligente de precios basado en tu foto:
    priceHot: { 
      type: Number, 
      min: 0 
    },
    priceCold: { 
      type: Number, 
      min: 0 
    },
    isSeasonal: {
      type: Boolean,
      default: false,
    },
    available: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    }
  },
  {
    timestamps: true, // Crea automáticamente campos de "creado" y "actualizado"
  }
);

// Evita re-compilar el modelo si ya existe (bug común en Next.js)
const Product = models.Product || model<IProduct>('Product', ProductSchema);

export default Product;