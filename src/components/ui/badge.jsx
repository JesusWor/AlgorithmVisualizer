const badgeVariants = {
  default: "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80",
  secondary:
    "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80",
  destructive: "border-transparent bg-red-600 text-gray-50 hover:bg-red-600/80",
  outline: "text-gray-950 border-gray-200",
};

export const Badge = ({ className = "", variant = "default", ...props }) => {
  const variantClass = badgeVariants[variant] || badgeVariants.default;

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 ${variantClass} ${className}`}
      {...props}
    />
  );
};
Badge.displayName = "Badge";
