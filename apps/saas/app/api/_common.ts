import { NextResponse } from "next/server";
import { readJson } from "@/src/lib/fs/readJson";
import { writeJson } from "@/src/lib/fs/writeJson";

export function makeJsonRoute(file: string) {
  return {
    async GET() {
      return NextResponse.json(readJson(file, {}));
    },
    async POST(req: Request) {
      const body = await req.json().catch(() => ({}));
      writeJson(file, body ?? {});
      return NextResponse.json({ ok: true });
    },
  };
}
