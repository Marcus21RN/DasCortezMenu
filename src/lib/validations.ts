import { z } from 'zod';

// Esquema para validar la creación/edición de productos
export const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").trim(),
  description: z.string().optional(),
  category: z.string().min(1, "La categoría es obligatoria"), // Esperamos el ID como string
  drinkType: z.enum(['Caliente', 'Frio', 'Ambos', 'General']),
  
  // Zod permite validar que si es número sea positivo, o null/undefined
  price: z.number().min(0).nullable().optional(),
  priceHot: z.number().min(0).nullable().optional(),
  priceCold: z.number().min(0).nullable().optional(),
  
  isSeasonal: z.boolean().optional(),
  available: z.boolean().optional(),
});