"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { leaveDashboardAction } from "@/app/actions";

type LeaveButtonProps = {
  hash: string;
};

/** Top-bar icon that leaves the dashboard directly, after a confirm — no menu involved. */
export function LeaveButton({ hash }: LeaveButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleConfirmed() {
    await leaveDashboardAction(hash);
    router.push("/");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        aria-label="Leave dashboard"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-white/[0.06] text-[#cbd5e1] transition hover:bg-white/10"
      >
        <LogOut size={15} strokeWidth={2} className="-scale-x-100" aria-hidden="true" />
      </button>
      {confirmOpen && (
        <ConfirmDialog
          title="Leave dashboard?"
          message="You can reopen it later with the dashboard hash."
          confirmLabel="Leave"
          danger
          onConfirm={handleConfirmed}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
