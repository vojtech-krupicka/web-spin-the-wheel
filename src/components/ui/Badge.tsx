type BadgeProps = {
  label: string;
  /** A category's hex color, alpha-blended for the pill background/border. Omit for the default "Public" cyan look. */
  color?: string;
};

export function Badge({ label, color }: BadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${
        color ? "" : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
      }`}
      style={color ? { color, borderColor: `${color}55`, backgroundColor: `${color}18` } : undefined}
    >
      {label}
    </span>
  );
}
