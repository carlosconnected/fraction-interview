import { PlayersTable } from "../components/players/PlayersTable";
import { getPlayers } from "../lib/api/players";

export default async function Home() {
  const initialPlayers = await getPlayers({
    sortBy: "playerName",
    sortOrder: "asc",
  });

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 font-sans dark:bg-black sm:px-8 sm:py-10">
      <main className="w-full max-w-6xl">
        <PlayersTable initialPlayers={initialPlayers} />
      </main>
    </div>
  );
}

