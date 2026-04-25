"use client";

import { useState } from "react";
import type { Plan } from "@/types";
import type { LocaleStrings } from "@/locales/en-GB";

type Props = {
  strings: LocaleStrings;
  plans: Plan[];
  activePlanId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: () => void;
  onDelete: (id: string) => void;
  onNew: () => void;
};

export function PlanManager({
  strings,
  plans,
  activePlanId,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
  onNew,
}: Props) {
  const p = strings.plans;
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function startRename(plan: Plan) {
    setRenamingId(plan.id);
    setRenameValue(plan.name);
  }

  function submitRename(id: string) {
    const trimmed = renameValue.trim();
    if (trimmed) onRename(id, trimmed);
    setRenamingId(null);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent, id: string) {
    if (e.key === "Enter") submitRename(id);
    if (e.key === "Escape") setRenamingId(null);
  }

  function handleDelete(id: string) {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {p.title}
        </h3>
        <button
          type="button"
          onClick={onNew}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          + {p.newPlan}
        </button>
      </div>

      {plans.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No plans yet. Create one to get started.
        </p>
      )}

      <ul className="flex flex-col gap-2" role="list">
        {plans.map((plan) => (
          <li
            key={plan.id}
            className={[
              "flex items-center gap-2 rounded-lg border px-3 py-2",
              plan.id === activePlanId
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800",
            ].join(" ")}
          >
            {renamingId === plan.id ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => submitRename(plan.id)}
                onKeyDown={(e) => handleRenameKeyDown(e, plan.id)}
                autoFocus
                aria-label={p.renamePlaceholder}
                className="flex-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <button
                type="button"
                onClick={() => onSelect(plan.id)}
                className="flex-1 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate"
                aria-current={plan.id === activePlanId ? "true" : undefined}
              >
                {plan.name}
              </button>
            )}

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                title={p.rename}
                aria-label={`${p.rename} ${plan.name}`}
                onClick={() => startRename(plan)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs"
              >
                ✏️
              </button>
              <button
                type="button"
                title={p.duplicate}
                aria-label={`${p.duplicate} ${plan.name}`}
                onClick={onDuplicate}
                disabled={plan.id !== activePlanId}
                className="rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
              >
                📋
              </button>
              {confirmDeleteId === plan.id ? (
                <>
                  <button
                    type="button"
                    aria-label={`${p.confirmDelete} ${plan.name}`}
                    onClick={() => handleDelete(plan.id)}
                    className="rounded px-2 py-1 text-xs bg-red-600 text-white hover:bg-red-700"
                  >
                    {p.confirmDelete}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    {p.cancelDelete}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  title={p.delete}
                  aria-label={`${p.delete} ${plan.name}`}
                  onClick={() => handleDelete(plan.id)}
                  className="rounded p-1 text-zinc-400 hover:text-red-600 text-xs"
                >
                  🗑️
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
