# Proof Merge — UI/UX Specification

## Project Overview

Proof Merge is a Web3 showcase platform for the **gitlawb** decentralized git network. Think "Etherscan for gitlawb" — a real-time explorer where users can watch AI agents work, earn on-chain skill badges, and discover crypto bounties.

**Goal:** Make gitlawb accessible and impressive to everyone. Target audience includes the gitlawb team, Web3 developers, and AI agent builders.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Web3:** wagmi + viem (wallet connection)
- **Network:** Base Sepolia (testnet)
- **Database:** Supabase (profiles, badges, bounties)

---

## Design Approach: Dashboard Explorer

Single-page dashboard with sidebar navigation. Dark theme. Feels like a blockchain explorer (Etherscan-style) but more modern.

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Header: Logo | Search | Network Status | Wallet    │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  Sidebar │     Main Content Area                    │
│          │                                          │
│  Feed    │     (changes based on active page)       │
│  Theater │                                          │
│  Badges  │                                          │
│  Bounty  │                                          │
│  Stats   │                                          │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│  Footer: Network Stats Mini Bar                     │
└─────────────────────────────────────────────────────┘
```

### Color Palette

- **Background:** `#030712` (near-black)
- **Surface:** `#111827` (gray-900)
- **Border:** `#1f2937` (gray-800)
- **Text Primary:** `#f9fafb` (white)
- **Text Secondary:** `#9ca3af` (gray-400)
- **Accent:** `#8b5cf6` (purple-500) — primary actions
- **Accent Hover:** `#7c3aed` (purple-600)
- **Success:** `#10b981` (green-500)
- **Warning:** `#f59e0b` (yellow-500)
- **Error:** `#ef4444` (red-500)

---

## Pages & Features

### 1. Live Activity Feed (`/`)

**Purpose:** Real-time stream of events from the gitlawb network. This is the default landing page.

**Data Source:** `GET /api/gitlawb/events` (currently returns empty — use mock data for now)

**Mock Events to Display:**
- Commit pushed (by human or AI agent)
- Pull request opened/merged
- Issue created/closed
- AI agent action (push code, review PR)
- Badge minted
- Bounty claimed

**UI Components:**
- Event card with: icon, actor name (DID), action type, detail, repo, timestamp
- Filter by event type (tabs or dropdown)
- Auto-scroll animation for new events
- "Streaming" indicator (green dot + pulse animation)

**Event Card Structure:**
```
┌─────────────────────────────────────────────┐
│ 🤖  claude-agent-47                  [agent] │
│     pushed 3 commits to                      │
│     feat: add pagination to issue list       │
│     gitlawb/explorer • 2 min ago             │
└─────────────────────────────────────────────┘
```

---

### 2. AI Agent Theater (`/theater`)

**Purpose:** Watch AI agents work in real-time. Visual showcase of agent capabilities.

**Data Source:** `GET /api/gitlawb/agents?limit=20`

**UI Components:**
- Grid of agent cards (2-3 columns)
- Each card shows: DID (truncated), trust score, capabilities, last seen
- Click agent → detail view with activity timeline
- "Live" indicator for currently active agents

**Agent Card Structure:**
```
┌─────────────────────────────────────┐
│ 🤖  z6MkHaXk...                    │
│     Trust: ████████░░ 0.35         │
│     Capabilities: push, fetch, PR  │
│     Last seen: 5 min ago           │
│     [View Profile]                 │
└─────────────────────────────────────┘
```

---

### 3. Profile & Badge System (`/badges`)

**Purpose:** Explore and mint ERC-1155 skill badges based on gitlawb contributions.

**Smart Contract:** `0x1B260DAdB7d1BfC0A2E223e9A888F03E9262Bb9D` (Base Sepolia)

**Badge Types:**
| ID | Name | Description |
|----|------|-------------|
| 1 | First Contribution | First merged PR on gitlawb |
| 2 | Bug Hunter | Closed 10+ issues |
| 3 | Top Reviewer | Reviewed 20+ PRs |
| 4 | Prolific Coder | 100+ commits |
| 5 | Agent Master | Deployed 5+ AI agents |
| 6 | Bounty Hunter | Claimed 3+ bounties |

**UI Components:**
- Badge grid (3 columns)
- Each badge: icon, name, description, mint status (locked/unlocked/minted)
- Connect wallet to check which badges user has
- Mint button (for eligible users)

**Badge Card Structure:**
```
┌─────────────────────────────────────┐
│ 🏅  First Contribution             │
│     Your first merged PR on        │
│     gitlawb network                │
│                                     │
│     Status: 🔒 Locked              │
│     [Connect Wallet to Check]      │
└─────────────────────────────────────┘
```

---

### 4. Bounty Board (`/bounties`)

**Purpose:** Discover and claim crypto bounties on gitlawb issues.

**Data Source:** `GET /api/gitlawb/bounties`

**Bounty Contract:** `0x8fc59d42b56fc153bcb9f871aae8e32bcf530789` (Base Sepolia)

**UI Components:**
- Bounty list (table or cards)
- Filter by status: Open, Claimed, Completed
- Each bounty: title, repo, amount, status, creator
- Click → detail view with claim button

**Bounty Card Structure:**
```
┌─────────────────────────────────────────────┐
│ 💰  Fix memory leak in firehose connector   │
│     gitlawb/node • $50 USDC                 │
│     Status: 🟢 Open                         │
│     Created: 2 hours ago                    │
│     [Claim Bounty]                          │
└─────────────────────────────────────────────┘
```

---

### 5. Network Stats (`/stats`)

**Purpose:** Visualize gitlawb network health, trending repos, top contributors.

**Data Source:**
- `GET /api/gitlawb/stats` — network totals
- `GET /api/gitlawb/repos` — repo list
- `GET /api/gitlawb/agents` — agent leaderboard

**UI Components:**
- Stats cards: Total Agents, Total Repos, Active Nodes, Total Bounties
- Trending repos list (sorted by recent activity)
- Top contributors leaderboard (sorted by trust score)
- Charts (optional): agent growth over time, commit activity

**Stats Dashboard Layout:**
```
┌──────────┬──────────┬──────────┬──────────┐
│  Agents  │   Repos  │  Nodes   │ Bounties │
│  31,804  │   3,799  │    3     │    32    │
└──────────┴──────────┴──────────┴──────────┘

┌───────────────────────────────────────────┐
│  Trending Repos                           │
│  • gitlawb/openclaude • 27k stars        │
│  • gitlawb/node • 1.2k stars             │
│  • gitlawb/contracts • 890 stars         │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│  Top Contributors                         │
│  1. z6MkHaXk... • Trust: 0.95 • 47 repos│
│  2. z6MkLpMn... • Trust: 0.88 • 32 repos│
│  3. z6MkQrSt... • Trust: 0.82 • 28 repos│
└───────────────────────────────────────────┘
```

---

## Available API Endpoints

All endpoints are in `/api/gitlawb/`:

| Endpoint | Method | Response |
|----------|--------|----------|
| `/api/gitlawb/stats` | GET | `{ nodes, agents, repos, commits24h, issues24h, prs24h }` |
| `/api/gitlawb/repos` | GET | Array of `{ name, owner, description, lastActivity }` |
| `/api/gitlawb/agents?limit=N&offset=N` | GET | Array of `{ did, name, trustScore, trustLevel }` |
| `/api/gitlawb/events` | GET | Array of events (currently empty) |
| `/api/gitlawb/bounties` | GET | Array of bounties (currently empty) |

---

## Component Structure

```
components/
├── layout/
│   ├── Sidebar.tsx        ✅ (exists, needs redesign)
│   ├── Header.tsx         ✅ (exists, needs redesign)
│   └── Footer.tsx         ❌ (create)
├── feed/
│   ├── ActivityFeed.tsx   ❌ (create)
│   ├── EventCard.tsx      ❌ (create)
│   └── EventFilter.tsx    ❌ (create)
├── theater/
│   ├── AgentGrid.tsx      ❌ (create)
│   ├── AgentCard.tsx      ❌ (create)
│   └── AgentTimeline.tsx  ❌ (create)
├── badges/
│   ├── BadgeGrid.tsx      ❌ (create)
│   ├── BadgeCard.tsx      ❌ (create)
│   └── BadgeMinter.tsx    ❌ (create)
├── bounties/
│   ├── BountyList.tsx     ❌ (create)
│   ├── BountyCard.tsx     ❌ (create)
│   └── BountyClaim.tsx    ❌ (create)
├── stats/
│   ├── StatsOverview.tsx  ❌ (create)
│   ├── TrendingRepos.tsx  ❌ (create)
│   └── Leaderboard.tsx    ❌ (create)
└── shared/
    ├── WalletButton.tsx   ❌ (create)
    ├── SearchBar.tsx      ❌ (create)
    └── LoadingSpinner.tsx ❌ (create)
```

---

## Data Flow

```
gitlawb network
      ↓
gitlawbounty.xyz API (proxy)
      ↓
/api/gitlawb/* (Next.js API routes)
      ↓
React components (fetch + display)
      ↓
User sees real-time gitlawb data
```

---

## Existing Files

- `app/layout.tsx` — Root layout with sidebar + header
- `app/page.tsx` — Live Activity Feed (mock data)
- `components/layout/Sidebar.tsx` — Navigation sidebar
- `components/layout/Header.tsx` — Header with wallet button
- `lib/gitlawb/client.ts` — API client
- `lib/gitlawb/types.ts` — TypeScript types
- `contracts/src/ProofMergeBadge.sol` — ERC-1155 badge contract

---

## Notes for AI Agent

1. **Dark theme only** — no light mode needed
2. **Mobile responsive** — sidebar collapses on mobile
3. **Loading states** — show skeletons while fetching data
4. **Error handling** — graceful fallbacks if API fails
5. **Animations** — subtle transitions, pulse effects for live indicators
6. **Accessibility** — proper ARIA labels, keyboard navigation
7. **Performance** — lazy load components, optimize images

---

## Reference Projects

- **gitlawbounty.xyz** — Similar project, terminal-style UI
- **Etherscan** — Blockchain explorer UX patterns
- **Vercel Dashboard** — Clean, modern dashboard design
