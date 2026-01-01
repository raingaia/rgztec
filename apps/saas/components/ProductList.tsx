import React, { useEffect, useState } from 'react';
import { getSaaSProducts, Product } from '../lib/store-logic';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Mantık katmanından işlenmiş veriyi çekiyoruz
    const data = getSaaSProducts();
    setProducts(data);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Global Marketplace Inventory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-blue-500 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                {product.store_key.toUpperCase()}
              </span>
              <span className="text-green-400 font-bold">${product.final_price}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
            <p className="text-sm text-gray-400 mb-4">Category: {product.section_slug}</p>
            <div className="border-t border-gray-700 pt-4 flex justify-between items-center text-xs">
              <span className="text-gray-500">Net Revenue (Est):</span>
              <span className="text-gray-300 font-semibold">${product.net_revenue}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
