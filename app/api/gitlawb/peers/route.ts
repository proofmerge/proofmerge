import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GITLAWB_API = "https://node.gitlawb.com/api/v1";

export async function GET() {
  try {
    const res = await fetch(`${GITLAWB_API}/peers`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json({ count: 0, peers: [] });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ count: 0, peers: [] });
  }
}
