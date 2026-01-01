'use client';
import { useParams } from 'next/navigation';
import ProductList from '@/components/ProductList'; //

export default function CategoryPage() {
  const params = useParams();
  const id = params.id as string; // URL'den gelen dinamik id (hardware, ai vb.)

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold capitalize border-b border-gray-800 pb-4">
          {id} Store Analysis
        </h1>
      </div>
      {/* Sadece bu kategoriye ait ürünleri dinamik olarak çeker */}
      <ProductList filter={id} searchTerm="" /> 
    </div>
  );
}

