import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GITLAWB_API = "https://node.gitlawb.com/api/v1";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || "0");

    const res = await fetch(`${GITLAWB_API}/repos`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    const repos = Array.isArray(data) ? data : data.repos || [];
    const sortedRepos = repos.sort(
      (a: { updated_at?: string }, b: { updated_at?: string }) =>
        new Date(b.updated_at || 0).getTime() -
        new Date(a.updated_at || 0).getTime()
    );

    return NextResponse.json(limit > 0 ? sortedRepos.slice(0, limit) : sortedRepos);
  } catch {
    return NextResponse.json([]);
  }
}
