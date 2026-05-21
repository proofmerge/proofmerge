import { NextResponse } from "next/server";
import { getNetworkEvents } from "@/lib/gitlawb/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await getNetworkEvents();
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch events from gitlawb" },
      { status: 502 }
    );
  }
}
