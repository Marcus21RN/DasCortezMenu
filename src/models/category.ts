import mongoose, { Schema, model, models } from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  {
    timestamps: true,
    versionKey: false 
  }
);

const Category = models.Category || model<ICategory>('Category', CategorySchema);

export default Category;