import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TloIloPanel } from './TloIloPanel'
import { IloCourseObjectivePanel } from './IloCourseObjectivePanel'

type Tab = 'tlo-ilo' | 'ilo-co'

export function MappingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tlo-ilo')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mappings</h1>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border bg-muted p-1 w-fit">
        <button
          onClick={() => setActiveTab('tlo-ilo')}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            activeTab === 'tlo-ilo'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          TLO → ILO
        </button>
        <button
          onClick={() => setActiveTab('ilo-co')}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            activeTab === 'ilo-co'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          ILO → Course Objective
        </button>
      </div>

      {/* Panel */}
      {activeTab === 'tlo-ilo' ? <TloIloPanel /> : <IloCourseObjectivePanel />}
    </div>
  )
}
