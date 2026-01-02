 "use client";

import { useParams } from "next/navigation";
// 3 nokta yerine tam olarak 2 nokta (../../) yapıyoruz:
import ProductList from "../../components/ProductList";

export default function CategoryPage() {
  // ... geri kalan kod aynı
}


export default function CategoryPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold capitalize border-b border-gray-800 pb-4">
          {id} Store Analysis
        </h1>
      </div>

      {/* Sadece bu kategoriye ait ürünleri çeker */}
      <ProductList filter={id} search="" />
    </div>
  );
}






