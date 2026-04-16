import { Check } from "lucide-react"
import { COLOR_PALETTE } from "@/lib/colorPalette"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
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
  )
}
