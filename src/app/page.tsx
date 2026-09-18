"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { JoinForm } from "@/components/home/JoinForm";
import { CreateDashboardPane } from "@/components/home/CreateDashboardPane";
import { QUOTES, randomQuote } from "@/lib/quotes";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams.get("hash") ?? "";
  const notFound = searchParams.get("error") === "not-found";
  const [createOpen, setCreateOpen] = useState(false);
  // Stable on the server (first quote) — swapped for a random one after mount
  // so hydration never sees a text mismatch.
  const [quote, setQuote] = useState(QUOTES[0]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: randomize only after mount to avoid a hydration mismatch
    setQuote(randomQuote());
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center px-6 pt-20 pb-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <svg
          width="60"
          height="60"
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="var(--color-panel-inset)"
            stroke="var(--color-accent-cyan)"
            strokeWidth="3"
          />
          <path d="M50 6 L50 50 L88 28" fill="var(--color-accent-violet)" opacity="0.55" />
          <path d="M50 6 L50 50 L12 28" fill="var(--color-accent-cyan)" opacity="0.4" />
          <circle cx="50" cy="50" r="7" fill="#67e8f9" />
          <path d="M50 2 L44 14 L56 14 Z" fill="#67e8f9" />
        </svg>
        <h1 className="text-xl font-bold tracking-[0.08em]">SPIN THE WHEEL</h1>
        <p className="text-sm text-muted">Enter a dashboard code to open it</p>
      </div>

      {notFound && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-400">
          That dashboard no longer exists.
        </p>
      )}

      <div className="mt-8 w-full max-w-sm">
        <JoinForm initialHash={initialHash} />
      </div>

      <div className="mt-6 flex w-full max-w-sm items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold tracking-[0.08em] text-faint">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="mt-5 flex w-full max-w-sm items-center justify-center gap-2 rounded-full border-[1.5px] border-accent-cyan/40 bg-accent-cyan/[0.06] py-3.5 text-[15px] font-bold text-accent-cyan transition active:scale-95"
      >
        <Plus size={16} aria-hidden="true" />
        Create New Dashboard
      </button>

      <div className="flex-1" />
      <p className="pt-8 text-xs text-faint">{quote}</p>

      {createOpen && <CreateDashboardPane onDismiss={() => setCreateOpen(false)} />}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
