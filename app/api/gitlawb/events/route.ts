import { NextResponse } from "next/server";
import { generateMockEvents } from "@/lib/gitlawb/mock-events";

export const dynamic = "force-dynamic";

const GITLAWB_API = "https://node.gitlawb.com/api/v1";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Try fetching real events from gitlawb node
    const res = await fetch(`${GITLAWB_API}/events?limit=${limit}`, {
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      const events = Array.isArray(data) ? data : data.events || [];
      if (events.length > 0) {
        return NextResponse.json(events);
      }
    }

    // Fallback to mock events if real data unavailable
    return NextResponse.json(generateMockEvents(limit));
  } catch {
    return NextResponse.json(generateMockEvents(20));
  }
}
