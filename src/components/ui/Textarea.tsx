type TextareaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

/** Multi-line names field, styled to match the panel-inset theme. */
export function Textarea({ value, onChange, placeholder, rows = 10 }: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-xl border border-border bg-panel-inset px-4 py-3 font-mono text-sm outline-none focus:border-border-strong placeholder:text-faint"
    />
  );
}
