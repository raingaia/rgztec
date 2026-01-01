import React from 'react';
import { getStoreAnalytics } from '../lib/store-logic';

const StoreAnalyticsTable = () => {
  const analyticsData = getStoreAnalytics();

  return (
    <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Financial Breakdown by Store</h3>
          <p className="text-sm text-gray-500 mt-1">Net profit and tax obligations per category</p>
        </div>
        <div className="text-xs font-mono text-gray-500 bg-gray-800 px-3 py-1 rounded">
          UPDATED: REAL-TIME
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Store Name</th>
              <th className="px-6 py-4 text-center">Items</th>
              <th className="px-6 py-4 text-right">Gross Sales</th>
              <th className="px-6 py-4 text-right">Tax Reserve</th>
              <th className="px-6 py-4 text-right text-green-400">Net Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {analyticsData.map((store) => (
              <tr key={store.name} className="hover:bg-blue-900/10 transition-colors group">
                <td className="px-6 py-4 font-bold text-blue-400 group-hover:text-blue-300">
                  {store.name}
                </td>
                <td className="px-6 py-4 text-center text-gray-400">
                  {store.count}
                </td>
                <td className="px-6 py-4 text-right font-mono text-gray-300">
                  ${store.totalSales.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-mono text-red-400/80">
                  -${store.tax.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-green-400">
                  ${store.netProfit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreAnalyticsTable;
