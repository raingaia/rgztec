"use client";

import { useParams } from "next/navigation";
import ProductList from "../../../components/ProductList";

export default function CategoryPage() {
  const params = useParams();
  const rawId = (params as any)?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId || "all";

  return (
    <main className="p-8 bg-black min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold capitalize border-b border-gray-800 pb-6 mb-6">
          {id} Store Analysis
        </h1>

        <ProductList filter={id} search="" />
      </div>
    </main>
  );
}

