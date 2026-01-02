"use client";

import React, { useEffect, useState } from "react";
import { getSaaSProducts, Product } from "../lib/store-logic";


interface Props {
  filter: string;
  search: string;
}

const ProductList = ({ filter, search }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let data = getSaaSProducts();
    
    // Kategori Filtresi
    if (filter !== 'all') {
      data = data.filter(p => p.store_key === filter);
    }
    
    // Arama Filtresi (Küçük/Büyük harf duyarsız)
    if (search) {
      data = data.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.id.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setProducts(data);
  }, [filter, search]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-gray-900 border border-gray-800 p-5 rounded-2xl hover:scale-[1.02] transition-transform duration-200">
           {/* Kart içeriği aynı kalıyor... */}
           <div className="flex justify-between mb-4">
             <span className="text-blue-400 text-xs font-mono">{product.id}</span>
             <span className="text-green-400 font-bold">${product.final_price}</span>
           </div>
           <h3 className="text-white font-semibold mb-1">{product.name}</h3>
           <p className="text-gray-500 text-xs mb-4 capitalize">{product.section_slug.replace('-', ' ')}</p>
           <div className="pt-4 border-t border-gray-800 text-[10px] text-gray-400 flex justify-between">
             <span>NET REVENUE:</span>
             <span className="text-gray-200 font-bold">${product.net_revenue}</span>
           </div>
        </div>
      ))}
      {products.length === 0 && (
        <div className="col-span-full text-center py-20 text-gray-500">
          No products found matching your search.
        </div>
      )}
    </div>
  );
};

export default ProductList;
