import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

const GITLAWB_API = "https://node.gitlawb.com/api/v1";

export async function GET() {
  try {
    const [agentsResult, reposResult, statsResult] = await Promise.all([
      syncAgents(),
      syncRepos(),
      syncStats(),
    ]);

    return NextResponse.json({
      success: true,
      agents: agentsResult,
      repos: reposResult,
      stats: statsResult,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}

async function syncAgents() {
  const res = await fetch(`${GITLAWB_API}/agents`);
  if (!res.ok) throw new Error(`gitlawb agents error: ${res.status}`);

  const data = await res.json();
  const agents = data.agents || [];

  // Batch upsert in chunks of 500
  const chunkSize = 500;
  let synced = 0;

  for (let i = 0; i < agents.length; i += chunkSize) {
    const chunk = agents.slice(i, i + chunkSize);
    const rows = chunk.map(
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

    if (error) console.error("Agent sync chunk error:", error);
    else synced += rows.length;
  }

  return synced;
}

async function syncRepos() {
  const res = await fetch(`${GITLAWB_API}/repos`);
  if (!res.ok) throw new Error(`gitlawb repos error: ${res.status}`);

  const data = await res.json();
  const repos = Array.isArray(data) ? data : [];

  const chunkSize = 500;
  let synced = 0;

  for (let i = 0; i < repos.length; i += chunkSize) {
    const chunk = repos.slice(i, i + chunkSize);
    const rows = chunk.map(
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

    if (error) console.error("Repo sync chunk error:", error);
    else synced += rows.length;
  }

  return synced;
}

async function syncStats() {
  const res = await fetch(`${GITLAWB_API}/stats`);
  if (!res.ok) throw new Error(`gitlawb stats error: ${res.status}`);

  const data = await res.json();

  const { error } = await supabase
    .from("gitlawb_stats")
    .upsert(
      {
        id: "network",
        agents: data.agents || 0,
        repos: data.repos || 0,
        pushes: data.pushes || 0,
        version: data.version || "unknown",
        synced_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) console.error("Stats sync error:", error);
  return data;
}
