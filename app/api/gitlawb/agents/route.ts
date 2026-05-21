import { NextResponse } from "next/server";
import { getAgents } from "@/lib/gitlawb/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agents = await getAgents();
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch agents from gitlawb" },
      { status: 502 }
    );
  }
}
