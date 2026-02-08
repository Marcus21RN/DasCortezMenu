import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

export const DRINK_TYPES = ['Caliente', 'Frio', 'Ambos', 'General'] as const;

export interface IProduct {
  name: string;
  description?: string;
  category: mongoose.Schema.Types.ObjectId; 
  drinkType: typeof DRINK_TYPES[number];
  priceHot?: number;
  sizeHot?: string;
  priceCold?: number;
  sizeCold?: string;
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
      type: Schema.Types.ObjectId, 
      ref: 'Category',             
      required: true,
    },
    drinkType: {
      type: String,
      enum: DRINK_TYPES,
      default: 'Ambos'
    },
    price: { type: Number, min: 0 },
    priceHot: { type: Number, min: 0 },
    sizeHot: { type: String },
    priceCold: { type: Number, min: 0 },
    sizeCold: { type: String },
    isSeasonal: { type: Boolean, default: false },
    available: { type: Boolean, default: true }
  },
);

const Product = models.Product || model<IProduct>('Product', ProductSchema);

export default Product;