"use client";

import { useRef, useState } from "react";
import type { LocaleStrings } from "@/locales/en-GB";
import { SectionCard } from "@/components/ui/SectionCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type DataControlsProps = {
  strings: LocaleStrings;
  exportPlanJson: () => string;
  importPlanJson: (raw: string) => { ok: true } | { ok: false; error: string };
  resetToExample: () => void;
};

type PendingAction = { type: "reset" } | { type: "import"; raw: string } | null;

export function DataControls({
  strings,
  exportPlanJson,
  importPlanJson,
  resetToExample,
}: DataControlsProps) {
  const s = strings.data;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [status, setStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  function handleExport() {
    const json = exportPlanJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "financial-planner-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : "";
      setPending({ type: "import", raw });
    };
    reader.readAsText(file);
  }

  function confirmPending() {
    if (!pending) return;
    if (pending.type === "reset") {
      resetToExample();
      setStatus(null);
    } else {
      const result = importPlanJson(pending.raw);
      setStatus(
        result.ok
          ? { kind: "success", message: s.importSuccess }
          : { kind: "error", message: `${s.importErrorPrefix}${result.error}` },
      );
    }
    setPending(null);
  }

  return (
    <SectionCard id="data" title={s.title}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {s.sensitivityWarning}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
        {s.noTransmission}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:text-zinc-300"
        >
          {s.export}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:text-zinc-300"
        >
          {s.import}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleFileSelected}
        />
        <button
          type="button"
          onClick={() => setPending({ type: "reset" })}
          className="min-h-11 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-red-800 dark:text-red-400"
        >
          {s.reset}
        </button>
      </div>

      {status && (
        <p
          role="status"
          className={
            status.kind === "success"
              ? "mt-4 text-sm font-medium text-green-700 dark:text-green-400"
              : "mt-4 text-sm font-medium text-red-600 dark:text-red-400"
          }
        >
          {status.message}
        </p>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={
          pending?.type === "reset" ? s.confirmResetTitle : s.confirmImportTitle
        }
        body={
          pending?.type === "reset" ? s.confirmResetBody : s.confirmImportBody
        }
        confirmLabel={s.confirm}
        cancelLabel={s.cancel}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />
    </SectionCard>
  );
}
