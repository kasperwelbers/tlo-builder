import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { BLOOM_LEVELS, BLOOM_CATEGORIES } from "@/lib/bloomLevels"
import { bloomBadgeClass } from "@/lib/bloomColors"
import { cn } from "@/lib/utils"

interface BloomSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  fullLabel: boolean
}

export function BloomSelect({ value, onValueChange, placeholder = "—" , fullLabel}: BloomSelectProps) {
  const selected = BLOOM_LEVELS.find(l => l.code === value)
  const label = fullLabel ? selected?.code + ' - ' + selected?.name   : selected?.code

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            `${fullLabel ? "px-3 py-2" : "size-8"}`,
            "flex shrink-0 items-center justify-center rounded-full border text-xs font-semibold ring-offset-background transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selected
              ? bloomBadgeClass(selected.code)
              : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {selected ? label : placeholder}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        {/* None option */}
        <DropdownMenuItem
          onClick={() => onValueChange("")}
          className="gap-2"
        >
          <Check className={cn("size-4", value === "" ? "opacity-100" : "opacity-0")} />
          <span className="text-muted-foreground">None</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {BLOOM_CATEGORIES.map((cat) => (
            <DropdownMenuSub key={cat.key}>
              <DropdownMenuSubTrigger className="gap-2">
                <span>{cat.label}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-80">
                  {BLOOM_LEVELS.filter(l => l.category === cat.key).map(level => (
                    <DropdownMenuItem
                      key={level.code}
                      onClick={() => onValueChange(level.code)}
                      className="flex-col items-start gap-1 p-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Check className={cn("size-4 shrink-0", value === level.code ? "opacity-100" : "opacity-0")} />
                        <span className="font-medium">
                          <span className="font-mono text-xs">{level.code}</span>
                          {"  "}{level.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6 whitespace-normal leading-relaxed">
                        {level.description}
                      </p>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
