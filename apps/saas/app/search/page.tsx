export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "Tüm Mağazalar";

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">RGZ Global Arama</h1>
        <p className="text-slate-500 mt-2 text-lg italic">90 bağımsız mağaza, tek bir sonuç ekranı.</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol Panel: Filtreler (Görsel temsil) */}
        <aside className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="font-bold text-slate-800 mb-4 uppercase text-sm tracking-widest">Kategoriler</h2>
          <ul className="space-y-2 text-slate-600">
            <li className="p-2 bg-blue-50 text-blue-700 rounded-lg font-medium cursor-pointer">Donanım Satış</li>
            <li className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-all">Kod Satış</li>
            <li className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-all">E-Pin Mağazaları</li>
          </ul>
        </aside>

        {/* Orta Panel: Sonuçlar */}
        <section className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-500 font-medium">"{query}" için sonuçlar</span>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">API AKTİF</span>
          </div>

          {/* Mağaza Kartı Örneği */}
          <div className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Ana Bayi - Kod Market</h3>
                <p className="text-slate-500 text-sm mt-1">Bu mağaza senin core motorunla otomatik yönetiliyor.</p>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-black text-blue-600 tracking-tighter">HESAPLANIYOR</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Matematik Motoru Bağlı</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
