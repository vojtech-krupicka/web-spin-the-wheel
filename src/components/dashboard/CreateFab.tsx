import { Plus } from "lucide-react";

type CreateFabProps = {
  label: string;
  onClick: () => void;
};

/** The floating circular create call-to-action, straddling the content area's bottom edge. */
export function CreateFab({ label, onClick }: CreateFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cta-gradient absolute bottom-[-38px] left-1/2 z-[7] flex h-[168px] w-[168px] -translate-x-1/2 cursor-pointer flex-col items-center justify-center gap-1 rounded-full shadow-[0_0_0_6px_var(--bg-stop-2),0_0_34px_rgba(139,92,246,0.55)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_0_6px_var(--bg-stop-2),0_0_46px_rgba(139,92,246,0.8)] active:scale-95"
    >
      <Plus size={30} strokeWidth={2.6} className="text-[#0a0b14]" aria-hidden="true" />
      <span className="text-[20px] font-bold text-[#0a0b14]">{label}</span>
    </button>
  );
}
