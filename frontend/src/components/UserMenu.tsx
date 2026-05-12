import { User, LogOut } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  email: string
}

export function UserMenu({ email }: Props) {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.reload()
  }

  return (
    <DropdownMenu>
      {/* No asChild — DropdownMenuTrigger renders its own button, which has the ref
          Radix needs to position the content. Using asChild with Button fails because
          Button doesn't forwardRef. */}
      <DropdownMenuTrigger className="fixed top-3 right-4 z-50 flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <User className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} variant="destructive">
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
