import React, { useState, useEffect } from 'react';
import SaaSStats from '../components/SaaSStats';
import ProductList from '../components/ProductList';
import { getSaaSProducts } from '../lib/store-logic';

const Dashboard = () => {
  const [selectedStore, setSelectedStore] = useState('all');
  const [allProducts, setAllProducts] = useState([]);
  
  // Mağaza listesini JSON'dan otomatik çekiyoruz (Tekrarlayanları siliyoruz)
  const stores = ['all', ...new Set(getSaaSProducts().map(p => p.store_key))];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Başlık Bölümü */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-400 mt-2">Global Inventory & Financial Overview</p>
        </div>
        <div className="bg-blue-600 px-4 py-2 rounded-lg font-bold">
          US Entity: Active
        </div>
      </div>

      {/* 1. Kısım: İstatistik Barı */}
      <SaaSStats />

      {/* 2. Kısım: Filtreleme Butonları */}
      <div className="flex flex-wrap gap-3 mb-8">
        {stores.map(store => (
          <button
            key={store}
            onClick={() => setSelectedStore(store)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedStore === store 
                ? 'bg-white text-black' 
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {store.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 3. Kısım: Dinamik Ürün Listesi */}
      <div className="border-t border-gray-800 pt-8">
        <ProductList filter={selectedStore} />
      </div>
    </div>
  );
};

export default Dashboard;
