import { NextResponse } from "next/server";
import { getNetworkStats } from "@/lib/gitlawb/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getNetworkStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats from gitlawb" },
      { status: 502 }
    );
  }
}
