import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search-index.builder";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = buildSearchIndex();
  return NextResponse.json(data);
}
