// Maps a bloom code prefix to badge colours
const CATEGORY_COLORS: Record<string, string> = {
  C: 'bg-blue-50 text-blue-700 border-blue-300',
  A: 'bg-green-50 text-green-700 border-green-300',
  P: 'bg-amber-50 text-amber-700 border-amber-300',
}

const CATEGORY_BG_COLORS: Record<string, string> = {
  C: 'bg-blue-50 text-black',
  A: 'bg-green-50 text-black',
  P: 'bg-amber-50 text-black',
}

export function bloomBadgeClass(code: string | null): string {
  if (!code) return ''
  return CATEGORY_COLORS[code[0]] ?? 'bg-muted text-muted-foreground'
}

export function bloomBgClass(code: string | null): string {
  if (!code) return 'bg-muted text-black'
  return CATEGORY_BG_COLORS[code[0]] ?? 'bg-muted text-black'
}
