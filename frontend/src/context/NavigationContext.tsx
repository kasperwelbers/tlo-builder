import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import type { Page } from "@/components/layout/AppShell"

interface NavContextValue {
  navigateTo: (page: Page) => void
}

const NavContext = createContext<NavContextValue>({ navigateTo: () => {} })

export function NavProvider({
  onNavigate,
  children,
}: {
  onNavigate: (page: Page) => void
  children: ReactNode
}) {
  return <NavContext.Provider value={{ navigateTo: onNavigate }}>{children}</NavContext.Provider>
}

export function useNav(): NavContextValue {
  return useContext(NavContext)
}
