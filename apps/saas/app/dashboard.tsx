'use client'; // App router'da state kullandığımız için şart

import React, { useState } from 'react';
import Link from 'next/link'; // Navigasyon için gerekli
import SaaSStats from '../components/SaaSStats';
import ProductList from '../components/ProductList';
import StoreAnalyticsTable from '../components/StoreAnalyticsTable';
import { getSaaSProducts } from '../lib/store-logic';

const Dashboard = () => {
  const [selectedStore, setSelectedStore] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const stores = ['all', ...new Set(getSaaSProducts().map(p => p.store_key))];

  return (
    <div className="min-h-screen bg-black text-white p-8 print:bg-white print:text-black">
      {/* Başlık Bölümü */}
      <div className="flex justify-between items-start mb-10 print:hidden">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-400 mt-2">Global Inventory & Financial Real-time Data</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button 
            onClick={() => window.print()}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-gray-700"
          >
            EXPORT PDF REPORT
          </button>
          <div className="bg-blue-600 px-4 py-1 rounded-full text-[10px] font-bold">
            US ENTITY: ACTIVE
          </div>
        </div>
      </div>

      <SaaSStats />

      {/* Arama ve Dinamik Filtreleme Grubu */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8 print:hidden">
        <div className="lg:col-span-1">
          <input 
            type="text" 
            placeholder="Search ID or Name..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Butonları Link'e çevirdik: Hem filtreler hem de sayfayı yönlendirir */}
        <div className="lg:col-span-3 flex flex-wrap gap-2">
          {stores.map(store => (
            <Link
              key={store}
              href={store === 'all' ? '/' : `/category/${store}`}
              onClick={() => setSelectedStore(store)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 border ${
                selectedStore === store 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white'
              }`}
            >
              {store.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* Ürün Listesi */}
      <div className="mb-12 print:hidden">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          Active Inventory
        </h2>
        <ProductList filter={selectedStore} searchTerm={searchTerm} />
      </div>

      {/* Finansal Analiz Tablosu */}
      <div className="mt-16 border-t border-gray-800 pt-10 print:mt-0 print:border-none">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded-full"></span>
          Revenue Distribution
        </h2>
        <StoreAnalyticsTable />
      </div>
    </div>
  );
};

export default Dashboard;
