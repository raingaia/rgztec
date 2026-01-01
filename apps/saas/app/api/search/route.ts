import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search-index.builder";

export const dynamic = "force-dynamic";

function norm(s: string) {
  return (s || "").toLowerCase().trim();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = norm(searchParams.get("q") || "");
  const store = norm(searchParams.get("store") || "");
  const section = norm(searchParams.get("section") || "");

  const data = buildSearchIndex();

  let filtered = data.filter((x) => x.is_active !== false);

  if (store) filtered = filtered.filter((x) => norm(x.store_key) === store);
  if (section) filtered = filtered.filter((x) => norm(x.section_slug) === section);

  if (!q) return NextResponse.json(filtered.slice(0, 50));

  const terms = q.split(/\s+/).filter(Boolean);

  const results = filtered
    .map((x) => {
      const hay = [x.name, ...(x.keywords || [])].map(norm).join(" ");
      let score = 0;
      for (const t of terms) {
        if (hay.includes(t)) score += 1;
      }
      return { ...x, _score: score };
    })
    .filter((x) => x._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 50);

  return NextResponse.json(results);
}
