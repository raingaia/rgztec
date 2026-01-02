import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search-index.builder";

export const dynamic = "force-static";

const index = buildSearchIndex();

export async function GET() {
  return NextResponse.json(index);
}


