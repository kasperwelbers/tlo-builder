import { useRef } from 'react'
import { Upload, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportTlos, parseCsvFile } from '@/lib/csv'
import { useApp } from '@/context/AppContext'
import type { Tlo } from '@/lib/types'

interface Props {
  tlos: Tlo[]
}

export function CsvActions({ tlos }: Props) {
  const { send, state } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    exportTlos(tlos, state.trajectories)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    try {
      const rows = await parseCsvFile(file)
      let count = 0
      for (const row of rows) {
        const trajectory = row['trajectory']?.trim()
        const name = row['name']?.trim()
        const description = row['description']?.trim() ?? ''
        const bloomLevel = row['bloomLevel']?.trim() || null
        if (!trajectory || !name) continue
        send({ type: 'tlo:add', trajectory, name, description, bloomLevel })
        count++
      }
      toast.success(`Imported ${count} TLO${count !== 1 ? 's' : ''}`)
    } catch (err) {
      toast.error('Failed to import CSV')
      console.error(err)
    }
  }

  return (
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" size="sm" onClick={handleImportClick}>
        <Upload className="size-4" />
        Import CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="size-4" />
        Export CSV
      </Button>
    </div>
  )
}
