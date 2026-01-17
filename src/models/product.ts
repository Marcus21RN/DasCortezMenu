import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

// Importamos el tipo de bebida solo para validación interna si quieres
export const DRINK_TYPES = ['Caliente', 'Frio', 'Ambos', 'General'] as const;

export interface IProduct {
  name: string;
  description?: string;
  // AQUI EL CAMBIO: category ya no es un string, es un ID que apunta a 'Category'
  category: mongoose.Schema.Types.ObjectId; 
  drinkType: typeof DRINK_TYPES[number];
  priceHot?: number;
  priceCold?: number;
  // price: único usado por categorías como "Extras"
  price?: number;
  isSeasonal?: boolean;
  available: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // REFERENCIA RELACIONAL
    category: {
      type: Schema.Types.ObjectId, // Guardamos el _id de la categoría
      ref: 'Category',             // Le decimos a Mongoose: "Este ID búscalo en la colección Category"
      required: true,
    },
    drinkType: {
      type: String,
      enum: DRINK_TYPES,
      default: 'Ambos'
    },
    price: { type: Number, min: 0 },
    priceHot: { type: Number, min: 0 },
    priceCold: { type: Number, min: 0 },
    isSeasonal: { type: Boolean, default: false },
    available: { type: Boolean, default: true }
  },
);

const Product = models.Product || model<IProduct>('Product', ProductSchema);

export default Product;