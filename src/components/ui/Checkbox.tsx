import { Check } from "lucide-react";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label"?: string;
};

export function Checkbox({ checked, onChange, ...rest }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      {...rest}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
        checked ? "cta-gradient border-transparent" : "border-border-strong bg-panel-inset"
      }`}
    >
      {checked && <Check size={13} strokeWidth={3} className="text-[#0a0b14]" aria-hidden="true" />}
    </button>
  );
}
