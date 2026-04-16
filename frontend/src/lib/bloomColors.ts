// Maps a bloom code prefix to badge colours
const CATEGORY_COLORS: Record<string, string> = {
  C: 'bg-blue-50 text-blue-700 border-blue-300',
  A: 'bg-green-50 text-green-700 border-green-300',
  P: 'bg-amber-50 text-amber-700 border-amber-300',
}

export function bloomBadgeClass(code: string | null): string {
  if (!code) return ''
  return CATEGORY_COLORS[code[0]] ?? 'bg-muted text-muted-foreground'
}
