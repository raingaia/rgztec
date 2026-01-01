import { NextResponse } from "next/server";
import searchIndex from "@/lib/search-index.json";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(searchIndex);
}

