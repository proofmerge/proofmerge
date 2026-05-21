import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const GITLAWB_API = "https://node.gitlawb.com/api/v1";

export async function GET() {
  try {
    const [agentsResult, reposResult] = await Promise.all([
      syncAgents(),
      syncRepos(),
    ]);

    return NextResponse.json({
      success: true,
      agents: agentsResult,
      repos: reposResult,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}

async function syncAgents() {
  const res = await fetch(`${GITLAWB_API}/agents?limit=100`);
  if (!res.ok) throw new Error(`gitlawb agents error: ${res.status}`);

  const data = await res.json();
  const agents = data.agents || [];

  const rows = agents.map(
    (a: {
      did: string;
      capabilities: string[];
      trust_score: number;
      registered_at: string;
      last_seen: string | null;
    }) => ({
      did: a.did,
      capabilities: a.capabilities,
      trust_score: a.trust_score,
      registered_at: a.registered_at,
      last_seen: a.last_seen,
      synced_at: new Date().toISOString(),
    })
  );

  const { error } = await supabase
    .from("gitlawb_agents")
    .upsert(rows, { onConflict: "did" });

  if (error) throw error;
  return rows.length;
}

async function syncRepos() {
  const res = await fetch(`${GITLAWB_API}/repos?limit=100`);
  if (!res.ok) throw new Error(`gitlawb repos error: ${res.status}`);

  const data = await res.json();
  const repos = Array.isArray(data) ? data : [];

  const rows = repos.map(
    (r: {
      id: string;
      name: string;
      owner_did: string;
      description: string | null;
      star_count: number;
      created_at: string;
      updated_at: string;
    }) => ({
      id: r.id,
      name: r.name,
      owner_did: r.owner_did,
      description: r.description,
      star_count: r.star_count || 0,
      created_at: r.created_at,
      updated_at: r.updated_at,
      synced_at: new Date().toISOString(),
    })
  );

  const { error } = await supabase
    .from("gitlawb_repos")
    .upsert(rows, { onConflict: "id" });

  if (error) throw error;
  return rows.length;
}
