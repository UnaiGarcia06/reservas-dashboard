const VARIANTS = {
  primary:
    "bg-brand text-white hover:bg-brand-hover shadow-card hover:shadow-card-hover",
  secondary:
    "bg-surface-card text-ink border border-surface-border hover:bg-surface",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface",
  danger: "text-status-occupied hover:bg-status-occupied-soft",
};

const SIZES = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-btn font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}