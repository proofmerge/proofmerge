import { NextResponse } from "next/server";
import { getAgents } from "@/lib/gitlawb/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const agents = await getAgents(limit, offset);
    return NextResponse.json(agents);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch agents from gitlawb" },
      { status: 502 }
    );
  }
}
