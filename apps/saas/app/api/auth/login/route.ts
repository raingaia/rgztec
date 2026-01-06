import { NextResponse } from "next/server";
import { setSession } from "@/src/lib/auth/session";
import { readJson } from "@/src/lib/readJson";

type User = {
  id: string;
  email: string;
  password: string;
  roles: string[];
  email_verified: boolean;
  active: boolean;
  blocked: boolean;
};

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const users = await readJson<User[]>("src/data/users/users.json");

    const user = users.find(
      (u) =>
        u.email === email &&
        u.password === password &&
        u.active &&
        !u.blocked
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.email_verified) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 403 }
      );
    }

    await setSession({
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles as any,
      },
      iat: Date.now(),
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}

