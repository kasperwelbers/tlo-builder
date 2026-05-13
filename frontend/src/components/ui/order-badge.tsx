import { cn } from "@/lib/utils"

interface OrderBadgeProps {
  label: string
  color: string
  shape: "circle" | "square"
  className?: string
}

export function OrderBadge({
  label,
  color,
  shape,
  className,
}: OrderBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center text-[10px] leading-none font-bold text-white select-none",
        shape === "circle" ? "rounded-full" : "rounded-sm",
        className
      )}
      style={{ backgroundColor: color || "#64748b" }}
    >
      {label}
    </span>
  )
}
