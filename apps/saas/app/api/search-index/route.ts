import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/build-search-index";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = buildSearchIndex();
  return NextResponse.json(data);
}
