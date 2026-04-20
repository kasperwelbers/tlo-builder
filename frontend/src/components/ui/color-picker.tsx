import { useState } from "react"
import { Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { COLOR_PALETTE } from "@/lib/colorPalette"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  shape?: "circle" | "square"
}

export function ColorPicker({ value, onChange, shape = "circle" }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn("size-6 border-2 border-white ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 shrink-0", shape === "square" ? "rounded-sm" : "rounded-full")}
          style={{ backgroundColor: value || "#64748b" }}
          title="Change color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex flex-wrap gap-2 max-w-50">
          {COLOR_PALETTE.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => { onChange(color); setOpen(false) }}
              className={cn(
                "size-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                value === color && "ring-2 ring-ring ring-offset-1"
              )}
              style={{ backgroundColor: color }}
              title={color}
            >
              {value === color && (
                <Check className="size-3.5 m-auto text-white drop-shadow" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
