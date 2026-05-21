import { NextResponse } from "next/server";
import { getRepos } from "@/lib/gitlawb/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repos = await getRepos();
    return NextResponse.json(repos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch repos from gitlawb" },
      { status: 502 }
    );
  }
}
