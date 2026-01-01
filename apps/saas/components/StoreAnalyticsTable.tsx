import React from 'react';
import { getStoreAnalytics } from '../lib/store-logic';

const StoreAnalyticsTable = () => {
  const analyticsData = getStoreAnalytics();

  return (
    <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm print:bg-transparent print:border-black print:mt-4">
      {/* Tablo Başlık Alanı */}
      <div className="px-6 py-5 border-b border-gray-800 flex justify-between items-center print:border-black">
        <div>
          <h3 className="text-xl font-bold text-white print:text-black">Financial Breakdown by Store</h3>
          <p className="text-sm text-gray-500 mt-1 print:text-gray-700">Net profit and tax obligations per category</p>
        </div>
        
        {/* Raporlama Butonu - Sadece ekranda görünür, kağıtta çıkmaz */}
        <div className="print:hidden flex items-center gap-3">
          <div className="text-[10px] font-mono text-gray-500 bg-gray-800 px-3 py-1 rounded">
            LIVE ANALYTICS
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/50 text-gray-400 uppercase text-[11px] tracking-wider print:bg-gray-100 print:text-black">
            <tr>
              <th className="px-6 py-4">Store Name</th>
              <th className="px-6 py-4 text-center">Items</th>
              <th className="px-6 py-4 text-right">Gross Sales</th>
              <th className="px-6 py-4 text-right">Tax Reserve</th>
              <th className="px-6 py-4 text-right text-green-400 print:text-green-700">Net Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 print:divide-gray-300">
            {analyticsData.map((store) => (
              <tr key={store.name} className="hover:bg-blue-900/10 transition-colors group print:text-black">
                <td className="px-6 py-4 font-bold text-blue-400 group-hover:text-blue-300 print:text-blue-800">
                  {store.name}
                </td>
                <td className="px-6 py-4 text-center text-gray-400 print:text-gray-700">
                  {store.count}
                </td>
                <td className="px-6 py-4 text-right font-mono text-gray-300 print:text-black">
                  ${store.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right font-mono text-red-400/80 print:text-red-700">
                  -${store.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-green-400 print:text-green-700">
                  ${store.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          
          {/* Toplam Satırı - Finansal özet için önemli */}
          <tfoot className="bg-black/40 font-bold border-t-2 border-gray-800 print:border-black print:text-black">
            <tr>
              <td className="px-6 py-4">TOTAL</td>
              <td className="px-6 py-4 text-center">
                {analyticsData.reduce((acc, curr) => acc + curr.count, 0)}
              </td>
              <td className="px-6 py-4 text-right">
                ${analyticsData.reduce((acc, curr) => acc + curr.totalSales, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-right text-red-400">
                -${analyticsData.reduce((acc, curr) => acc + curr.tax, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 text-right text-green-400">
                ${analyticsData.reduce((acc, curr) => acc + curr.netProfit, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default StoreAnalyticsTable;
