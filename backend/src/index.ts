import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

type SortableField =
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

type SortOrder = "asc" | "desc";

type PlayerCacheKey = `${SortableField}:${SortOrder}`;

const listCache = new Map<PlayerCacheKey, unknown>();

const VALID_SORT_FIELDS: SortableField[] = [
  "playerName",
  "position",
  "games",
  "atBat",
  "runs",
  "hits",
  "doubles",
  "triples",
  "homeRuns",
  "rbi",
  "walks",
  "strikeouts",
  "stolenBases",
  "caughtStealing",
  "avg",
  "obp",
  "slg",
  "ops",
];

const isSortableField = (value: unknown): value is SortableField => {
  return (
    typeof value === "string" &&
    (VALID_SORT_FIELDS as string[]).includes(value)
  );
};

const isSortOrder = (value: unknown): value is SortOrder => {
  return value === "asc" || value === "desc";
};

app.get("/api/players", async (req: Request, res: Response) => {
  try {
    const sortByQuery = req.query.sortBy;
    const sortOrderQuery = req.query.sortOrder;

    const sortByParam = String(
      typeof sortByQuery === "string" ? sortByQuery : "playerName",
    );
    const sortOrderParam = String(
      typeof sortOrderQuery === "string" ? sortOrderQuery : "asc",
    );

    const sortBy: SortableField = isSortableField(sortByParam)
      ? sortByParam
      : "playerName";
    const sortOrder: SortOrder = isSortOrder(sortOrderParam)
      ? sortOrderParam
      : "asc";

    const cacheKey: PlayerCacheKey = `${sortBy}:${sortOrder}`;
    if (listCache.has(cacheKey)) {
      return res.json(listCache.get(cacheKey));
    }

    const players = await prisma.player.findMany({
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    listCache.set(cacheKey, players);
    return res.json(players);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching players", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

app.get("/api/players/:id", async (req: Request, res: Response) => {
  try {
    const id = Number.parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "InvalidId" });
    }

    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) {
      return res.status(404).json({ error: "NotFound" });
    }

    return res.json(player);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error fetching player", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

app.put("/api/players/:id", async (req: Request, res: Response) => {
  try {
    const id = Number.parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "InvalidId" });
    }

    const {
      position,
      games,
      atBat,
      runs,
      hits,
      doubles,
      triples,
      homeRuns,
      rbi,
      walks,
      strikeouts,
      stolenBases,
      caughtStealing,
      avg,
      obp,
      slg,
      ops,
    } = req.body ?? {};

    const data: Record<string, unknown> = {};

    if (position !== undefined) data.position = position;
    if (games !== undefined) data.games = games;
    if (atBat !== undefined) data.atBat = atBat;
    if (runs !== undefined) data.runs = runs;
    if (hits !== undefined) data.hits = hits;
    if (doubles !== undefined) data.doubles = doubles;
    if (triples !== undefined) data.triples = triples;
    if (homeRuns !== undefined) data.homeRuns = homeRuns;
    if (rbi !== undefined) data.rbi = rbi;
    if (walks !== undefined) data.walks = walks;
    if (strikeouts !== undefined) data.strikeouts = strikeouts;
    if (stolenBases !== undefined) data.stolenBases = stolenBases;
    if (caughtStealing !== undefined) data.caughtStealing = caughtStealing;
    if (avg !== undefined) data.avg = avg;
    if (obp !== undefined) data.obp = obp;
    if (slg !== undefined) data.slg = slg;
    if (ops !== undefined) data.ops = ops;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "NoFieldsToUpdate" });
    }

    try {
      const updated = await prisma.player.update({
        where: { id },
        data,
      });

      // clear list cache so subsequent GETs see the updated data
      listCache.clear();

      return res.json(updated);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error updating player", err);
      return res.status(404).json({ error: "NotFound" });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Unexpected error updating player", err);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

const port = Number.parseInt(process.env.PORT ?? "4000", 10);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});

