import { NextResponse } from "next/server";
import { generateMockEvents } from "@/lib/gitlawb/mock-events";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Generate mock events since real events require direct node access
    const events = generateMockEvents(20);
    return NextResponse.json(events);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate events" },
      { status: 500 }
    );
  }
}
