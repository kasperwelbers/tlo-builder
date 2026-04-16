import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BLOOM_LEVELS, BLOOM_CATEGORIES } from "@/lib/bloomLevels"
import { cn } from "@/lib/utils"

interface BloomSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function BloomSelect({ value, onValueChange, placeholder = "None" }: BloomSelectProps) {
  const selected = BLOOM_LEVELS.find(l => l.code === value)

  return (
    <TooltipProvider delayDuration={300}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              !selected && "text-muted-foreground"
            )}
          >
            <span>{selected ? `${selected.code}  ${selected.name}` : placeholder}</span>
            <ChevronDown className="size-4 opacity-50" />
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

          {BLOOM_CATEGORIES.map((cat, i) => (
            <React.Fragment key={cat.key}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cat.label}
                </DropdownMenuLabel>
                {BLOOM_LEVELS.filter(l => l.category === cat.key).map(level => (
                  <Tooltip key={level.code}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        onClick={() => onValueChange(level.code)}
                        className="gap-2"
                      >
                        <Check className={cn("size-4 shrink-0", value === level.code ? "opacity-100" : "opacity-0")} />
                        <span>
                          <span className="font-mono text-xs">{level.code}</span>
                          {"  "}{level.name}
                        </span>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {level.description}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </DropdownMenuGroup>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
