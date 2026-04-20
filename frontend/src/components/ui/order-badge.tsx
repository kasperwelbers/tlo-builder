import { cn } from "@/lib/utils"

interface OrderBadgeProps {
  num: number
  color: string
  shape: "circle" | "square"
  className?: string
}

export function OrderBadge({ num, color, shape, className }: OrderBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 size-5 text-[10px] font-bold text-white leading-none select-none",
        shape === "circle" ? "rounded-full" : "rounded-sm",
        className
      )}
      style={{ backgroundColor: color || "#64748b" }}
    >
      {num}
    </span>
  )
}
