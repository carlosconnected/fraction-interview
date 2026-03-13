"use client";

import { useEffect, useMemo, useState } from "react";

import {
  type Player,
  type SortableField,
  type SortOrder,
  getPlayers,
  updatePlayer,
} from "../../lib/api/players";

type Props = {
  initialPlayers: Player[];
};

type EditingState = {
  [K in keyof Player]?: Player[K];
};

const DEFAULT_SORT_BY: SortableField = "playerName";
const DEFAULT_SORT_ORDER: SortOrder = "asc";

export function PlayersTable({ initialPlayers }: Props) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [sortBy, setSortBy] = useState<SortableField>(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<EditingState>({});

  useEffect(() => {
    if (
      players.length === 0 ||
      sortBy !== DEFAULT_SORT_BY ||
      sortOrder !== DEFAULT_SORT_ORDER
    ) {
      void refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  const currentSortLabel = useMemo(
    () => `${sortBy} (${sortOrder})`,
    [sortBy, sortOrder],
  );

  async function refetch() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlayers({ sortBy, sortOrder });
      setPlayers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch players.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleHeaderClick(field: SortableField) {
    setSortBy(field);
    setSortOrder((prev) =>
      sortBy === field ? (prev === "asc" ? "desc" : "asc") : "asc",
    );
  }

  function beginEdit(player: Player) {
    setEditingId(player.id);
    setEditingValues(player);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingValues({});
  }

  function handleChange<K extends keyof Player>(
    key: K,
    value: Player[K] | string,
  ) {
    setEditingValues((prev) => ({
      ...prev,
      [key]:
        typeof prev[key] === "number"
          ? (Number(value) as Player[K])
          : (value as Player[K]),
    }));
  }

  async function saveEdit() {
    if (editingId == null) return;

    const {
      id: _id,
      playerName: _name,
      ...updatable
    } = editingValues as Player;

    try {
      setLoading(true);
      setError(null);
      await updatePlayer(editingId, updatable);
      await refetch();
      cancelEdit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update player.",
      );
      setLoading(false);
    }
  }

  function renderSortIndicator(field: SortableField) {
    if (sortBy !== field) return null;
    return <span>{sortOrder === "asc" ? "▲" : "▼"}</span>;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Baseball Players
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sorting by {currentSortLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={loading}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900/60">
            <tr>
              {[
                ["playerName", "Player"],
                ["position", "Pos"],
                ["games", "G"],
                ["atBat", "AB"],
                ["runs", "R"],
                ["hits", "H"],
                ["homeRuns", "HR"],
                ["rbi", "RBI"],
                ["avg", "AVG"],
                ["obp", "OBP"],
                ["slg", "SLG"],
                ["ops", "OPS"],
              ].map(([field, label]) => (
                <th
                  key={field}
                  scope="col"
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleHeaderClick(field as SortableField)
                    }
                    className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-50"
                  >
                    <span>{label}</span>
                    {renderSortIndicator(field as SortableField)}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {players.map((player) => {
              const isEditing = editingId === player.id;
              const values = (isEditing ? editingValues : player) as Player;

              return (
                <tr key={player.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/80">
                  <td className="whitespace-nowrap px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {player.playerName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200">
                    {isEditing ? (
                      <input
                        className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        value={values.position}
                        onChange={(e) =>
                          handleChange("position", e.target.value)
                        }
                      />
                    ) : (
                      player.position
                    )}
                  </td>
                  {(
                    [
                      "games",
                      "atBat",
                      "runs",
                      "hits",
                      "homeRuns",
                      "rbi",
                    ] as const
                  ).map((key) => (
                    <td
                      key={key}
                      className="whitespace-nowrap px-3 py-2 text-right text-sm text-zinc-700 dark:text-zinc-200"
                    >
                      {isEditing ? (
                        <input
                          className="w-16 rounded-md border border-zinc-300 px-2 py-1 text-xs text-right dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                          type="number"
                          value={values[key]}
                          onChange={(e) =>
                            handleChange(key, e.target.value)
                          }
                        />
                      ) : (
                        player[key]
                      )}
                    </td>
                  ))}
                  {(
                    ["avg", "obp", "slg", "ops"] as const
                  ).map((key) => (
                    <td
                      key={key}
                      className="whitespace-nowrap px-3 py-2 text-right text-sm text-zinc-700 dark:text-zinc-200"
                    >
                      {isEditing ? (
                        <input
                          className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-xs text-right dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                          type="number"
                          step="0.001"
                          value={values[key]}
                          onChange={(e) =>
                            handleChange(key, e.target.value)
                          }
                        />
                      ) : (
                        values[key].toFixed(3)
                      )}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-2 text-right text-sm">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-full px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => void saveEdit()}
                          className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => beginEdit(player)}
                        className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading…
        </p>
      )}
    </div>
  );
}

