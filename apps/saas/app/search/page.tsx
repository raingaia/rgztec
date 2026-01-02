"use client";

import React, { useMemo, useState } from "react";
import ProductList from "@/components/ProductList";

type Props = {
  initialQuery: string;
};

type CategoryKey = "all" | "hardware" | "code" | "epin";

const CATEGORIES: { key: CategoryKey; label: string; hint: string }[] = [
  { key: "all", label: "Tüm Kategoriler", hint: "Hepsi" },
  { key: "hardware", label: "Donanım Satış", hint: "Hardware" },
  { key: "code", label: "Kod Satış", hint: "Code" },
  { key: "epin", label: "E-Pin Mağazaları", hint: "E-Pin" },
];

export default function SearchUI({ initialQuery }: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [q, setQ] = useState<string>(initialQuery || "");

  const headerQuery = useMemo(() => {
    const t = (q || "").trim();
    return t ? t : "Tüm Mağazalar";
  }, [q]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          RGZ Global Arama
        </h1>
        <p className="text-slate-500 mt-2 text-lg italic">
          90 bağımsız mağaza, tek bir sonuç ekranı.
        </p>

        {/* Search box */}
        <div className="mt-6 flex gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ürün / ID ara… (örn: ai, kit, pro, 001)"
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setQ("")}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:bg-slate-50"
          >
            Temizle
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol Panel */}
        <aside className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="font-bold text-slate-800 mb-4 uppercase text-sm tracking-widest">
            Kategoriler
          </h2>

          <ul className="space-y-2 text-slate-600">
            {CATEGORIES.map((c) => {
              const active = c.key === activeCategory;
              return (
                <li
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={[
                    "p-2 rounded-lg cursor-pointer transition-all select-none",
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-slate-50",
                  ].join(" ")}
                  title={c.hint}
                >
                  {c.label}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Orta Panel */}
        <section className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-500 font-medium">
              "{headerQuery}" için sonuçlar
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
              API AKTİF
            </span>
          </div>

          {/* SONUÇLAR: senin gerçek motorun */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            {/* ProductList: filter = store_key, search = q */}
            <ProductList
              filter={activeCategory === "all" ? "all" : activeCategory}
              search={q}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

