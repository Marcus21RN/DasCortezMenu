"use client";

import React, { useEffect, useState } from 'react';
import ProductForm from '@/components/productForm';

interface Category {
  _id: string;
  name: string;
}

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/menu');
        const data = (await res.json()) as Category[];
        const cats = data.map((c) => ({ _id: c._id, name: c.name }));
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return <ProductForm categories={categories} />;
}
