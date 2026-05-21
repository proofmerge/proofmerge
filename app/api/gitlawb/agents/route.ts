import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GITLAWB_API = "https://node.gitlawb.com/api/v1";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const res = await fetch(`${GITLAWB_API}/agents`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json({ agents: [] });
    }

    const data = await res.json();
    const allAgents = data.agents || [];
    const sliced = allAgents.slice(offset, offset + limit);

    return NextResponse.json({ agents: sliced, total: allAgents.length });
  } catch {
    return NextResponse.json({ agents: [], total: 0 });
  }
}
