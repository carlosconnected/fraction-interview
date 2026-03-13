import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type RawPlayer = {
  ["Player name"]: string;
  position: string;
  Games: number;
  ["At-bat"]: number;
  Runs: number;
  Hits: number;
  ["Double (2B)"]: number;
  ["third baseman"]: number;
  ["home run"]: number;
  ["run batted in"]: number;
  ["a walk"]: number;
  Strikeouts: number;
  ["stolen base"]: number;
  ["Caught stealing"]: number | string;
  AVG: number;
  ["On-base Percentage"]: number;
  ["Slugging Percentage"]: number;
  ["On-base Plus Slugging"]: number;
};

async function fetchRemoteData(): Promise<RawPlayer[] | null> {
  try {
    const response = await fetch(
      "https://api.hirefraction.com/api/test/baseball",
    );

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        `Remote fetch failed with status ${response.status}, falling back to local file if available.`,
      );
      return null;
    }

    const json = (await response.json()) as RawPlayer[];
    return json;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Remote fetch threw, falling back to local file.", err);
    return null;
  }
}

async function readLocalData(): Promise<RawPlayer[]> {
  const filePath = path.resolve(
    __dirname,
    "../../../data/data.json",
  );
  const contents = await readFile(filePath, "utf-8");
  const json = JSON.parse(contents) as RawPlayer[];
  return json;
}

function mapRawToPrisma(data: RawPlayer) {
  const caughtStealingRaw = data["Caught stealing"];
  const caughtStealing =
    typeof caughtStealingRaw === "number"
      ? caughtStealingRaw
      : Number.isNaN(Number.parseInt(caughtStealingRaw, 10))
        ? null
        : Number.parseInt(caughtStealingRaw, 10);

  return {
    playerName: data["Player name"],
    position: data.position,
    games: data.Games,
    atBat: data["At-bat"],
    runs: data.Runs,
    hits: data.Hits,
    doubles: data["Double (2B)"],
    triples: data["third baseman"],
    homeRuns: data["home run"],
    rbi: data["run batted in"],
    walks: data["a walk"],
    strikeouts: data.Strikeouts,
    stolenBases: data["stolen base"],
    caughtStealing,
    avg: data.AVG,
    obp: data["On-base Percentage"],
    slg: data["Slugging Percentage"],
    ops: data["On-base Plus Slugging"],
  };
}

async function main() {
  // eslint-disable-next-line no-console
  console.log("Importing baseball stats...");

  const remote = await fetchRemoteData();
  const rawData = remote ?? (await readLocalData());

  for (const record of rawData) {
    const mapped = mapRawToPrisma(record);

    // upsert by playerName so we can re-run import safely
    // eslint-disable-next-line no-await-in-loop
    await prisma.player.upsert({
      where: { playerName: mapped.playerName },
      create: mapped,
      update: mapped,
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Imported ${rawData.length} players.`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to import baseball stats", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

