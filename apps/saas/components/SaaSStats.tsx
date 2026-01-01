import React from 'react';
import { getSaaSProducts } from '../lib/store-logic';

const SaaSStats = () => {
  const products = getSaaSProducts();
  
  // Matematik Motoru Burada Çalışıyor
  const totalGross = products.reduce((acc, curr) => acc + curr.final_price, 0);
  const totalNet = products.reduce((acc, curr) => acc + curr.net_revenue, 0);
  const totalTax = totalGross * 0.08; // Sabit %8 eyalet vergisi varsayımı
  const productCount = products.length;

  const stats = [
    { label: 'Total Inventory Value', value: `$${totalGross.toLocaleString()}`, color: 'text-white' },
    { label: 'Expected Net Profit', value: `$${totalNet.toLocaleString()}`, color: 'text-green-400' },
    { label: 'Tax Obligations', value: `$${totalTax.toLocaleString()}`, color: 'text-red-400' },
    { label: 'Active Products', value: productCount, color: 'text-blue-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default SaaSStats;
