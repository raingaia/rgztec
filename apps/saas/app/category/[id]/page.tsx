'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProductList from '../../../components/ProductList';
import SaaSStats from '../../../components/SaaSStats';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Geri Dönüş Butonu */}
      <a href="/" className="text-blue-500 hover:text-blue-400 text-sm mb-6 inline-block">
        ← Back to Global Dashboard
      </a>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-white">
          {categoryId} Segment Analysis
        </h1>
        <p className="text-gray-400 mt-2">Specific financial metrics and inventory for this store category.</p>
      </div>

      {/* Sadece bu kategoriye özel istatistikler ve liste */}
      <SaaSStats filter={categoryId} /> 
      
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          Category Inventory
        </h2>
        <ProductList filter={categoryId} searchTerm="" />
      </div>
    </div>
  );
}
