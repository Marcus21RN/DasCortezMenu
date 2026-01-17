import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

export interface ICategory {
  _id?: string;
  name: string;      // Ej: "Bebidas a base de Espresso"
  slug: string;      // Ej: "bebidas-espresso" (útil para URLs o IDs internos)
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    }
  },
);

// Evitar error de recompilación en Next.js
const Category = models.Category || model<ICategory>('Category', CategorySchema);

export default Category;