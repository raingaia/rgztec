import React, { useState } from 'react';
import SaaSStats from '../components/SaaSStats';
import ProductList from '../components/ProductList';
import StoreAnalyticsTable from '../components/StoreAnalyticsTable'; // <-- Yeni eklediğimiz tablo
import { getSaaSProducts } from '../lib/store-logic';

const Dashboard = () => {
  const [selectedStore, setSelectedStore] = useState('all');
  
  // Mağaza listesini JSON'dan otomatik çekiyoruz
  const stores = ['all', ...new Set(getSaaSProducts().map(p => p.store_key))];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Başlık Bölümü */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-400 mt-2">Global Inventory & Financial Real-time Data</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-blue-600 px-4 py-1 rounded-full text-xs font-bold mb-1">
            US ENTITY: ACTIVE
          </div>
          <p className="text-xs text-gray-500 font-mono">ID: RGZ-90-GLOBAL</p>
        </div>
      </div>

      {/* 1. Kısım: Üst Özet İstatistikler */}
      <SaaSStats />

      {/* 2. Kısım: Mağaza Filtreleme Menüsü */}
      <div className="flex flex-wrap gap-3 mb-8 bg-gray-900/30 p-4 rounded-2xl border border-gray-800">
        {stores.map(store => (
          <button
            key={store}
            onClick={() => setSelectedStore(store)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              selectedStore === store 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {store.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 3. Kısım: Dinamik Ürün Listesi */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          Active Inventory
        </h2>
        <ProductList filter={selectedStore} />
      </div>

      {/* 4. Kısım: Finansal Analiz Tablosu (Final Dokunuşu) */}
      <div className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded-full"></span>
          Revenue Distribution
        </h2>
        <StoreAnalyticsTable />
      </div>
    </div>
  );
};

export default Dashboard;
