import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { HelpModal } from '@/components/help/HelpModal'
import type { HelpPage } from '@/components/help/HelpModal'

interface HelpContextValue {
  openHelp: (page?: HelpPage) => void
}

const HelpContext = createContext<HelpContextValue>({ openHelp: () => {} })

export function HelpProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<HelpPage>('overview')

  function openHelp(p: HelpPage = 'overview') {
    setPage(p)
    setOpen(true)
  }

  return (
    <HelpContext.Provider value={{ openHelp }}>
      {children}
      <HelpModal open={open} onOpenChange={setOpen} page={page} onPageChange={setPage} />
    </HelpContext.Provider>
  )
}

export function useHelp(): HelpContextValue {
  return useContext(HelpContext)
}
