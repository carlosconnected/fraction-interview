-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "Player name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "Games" INTEGER NOT NULL,
    "At-bat" INTEGER NOT NULL,
    "Runs" INTEGER NOT NULL,
    "Hits" INTEGER NOT NULL,
    "Double (2B)" INTEGER NOT NULL,
    "third baseman" INTEGER NOT NULL,
    "home run" INTEGER NOT NULL,
    "run batted in" INTEGER NOT NULL,
    "a walk" INTEGER NOT NULL,
    "Strikeouts" INTEGER NOT NULL,
    "stolen base" INTEGER NOT NULL,
    "Caught stealing" INTEGER,
    "AVG" DOUBLE PRECISION NOT NULL,
    "On-base Percentage" DOUBLE PRECISION NOT NULL,
    "Slugging Percentage" DOUBLE PRECISION NOT NULL,
    "On-base Plus Slugging" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_Player name_key" ON "players"("Player name");
