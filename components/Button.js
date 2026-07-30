const VARIANTS = {
  primary:
    "bg-ink-800 text-paper-0 hover:bg-ink-700 shadow-card hover:shadow-card-hover",
  secondary:
    "bg-paper-0 text-ink-800 border border-paper-300 hover:bg-paper-100",
  ghost: "text-ink-600 hover:text-ink-800 hover:bg-paper-100",
  danger: "text-stamp-clay hover:text-stamp-clay-strong hover:bg-stamp-clay-soft",
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