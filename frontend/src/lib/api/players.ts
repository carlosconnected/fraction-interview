export type Player = {
  id: number;
  playerName: string;
  position: string;
  games: number;
  atBat: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  stolenBases: number;
  caughtStealing: number | null;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
};

export type SortableField =
  | "playerName"
  | "position"
  | "games"
  | "atBat"
  | "runs"
  | "hits"
  | "doubles"
  | "triples"
  | "homeRuns"
  | "rbi"
  | "walks"
  | "strikeouts"
  | "stolenBases"
  | "caughtStealing"
  | "avg"
  | "obp"
  | "slg"
  | "ops";

export type SortOrder = "asc" | "desc";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function getPlayers(params?: {
  sortBy?: SortableField;
  sortOrder?: SortOrder;
}): Promise<Player[]> {
  const search = new URLSearchParams();
  if (params?.sortBy) search.set("sortBy", params.sortBy);
  if (params?.sortOrder) search.set("sortOrder", params.sortOrder);

  const url =
    search.toString().length > 0
      ? `${BACKEND_BASE_URL}/api/players?${search.toString()}`
      : `${BACKEND_BASE_URL}/api/players`;

  const res = await fetch(url, {
    // Let the backend and browser cache as configured.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch players (${res.status})`);
  }

  const data = (await res.json()) as Player[];
  return data;
}

export async function updatePlayer(
  id: number,
  updates: Partial<Omit<Player, "id" | "playerName">>,
): Promise<Player> {
  const url = `${BACKEND_BASE_URL}/api/players/${id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error(`Failed to update player (${res.status})`);
  }

  const data = (await res.json()) as Player;
  return data;
}

