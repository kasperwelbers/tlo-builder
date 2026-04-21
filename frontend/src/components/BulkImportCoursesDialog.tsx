import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { ColorPicker } from '@/components/ui/color-picker'
import { useApp } from '@/context/AppContext'
import { randomColor } from '@/lib/colorPalette'

interface Row {
  name: string
  description: string
  start: string
  end: string
  coordinator: string
  color: string
}

function makeRow(): Row {
  return { name: '', description: '', start: '', end: '', coordinator: '', color: randomColor() }
}

function makeRows(n: number): Row[] {
  return Array.from({ length: n }, makeRow)
}

// Column order when pasting from a spreadsheet (left to right)
const PASTE_COLUMNS: (keyof Omit<Row, 'color'>)[] = [
  'name',
  'description',
  'start',
  'end',
  'coordinator',
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkImportCoursesDialog({ open, onOpenChange }: Props) {
  const { send } = useApp()
  const [rows, setRows] = useState<Row[]>(() => makeRows(5))

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  function addRows() {
    setRows(prev => [...prev, ...makeRows(5)])
  }

  function removeRow(index: number) {
    setRows(prev => prev.filter((_, i) => i !== index))
  }

  // colIndex is the index into PASTE_COLUMNS (0 = name, 1 = description, 2 = start, 3 = end, 4 = coordinator)
  function handlePaste(
    e: React.ClipboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number,
  ) {
    const text = e.clipboardData.getData('text/plain')
    if (!text.includes('\t') && !text.includes('\n')) return

    e.preventDefault()

    const pastedRows = text
      .trimEnd()
      .split('\n')
      .map(line => line.split('\t'))

    setRows(prev => {
      const updated = [...prev]
      for (let r = 0; r < pastedRows.length; r++) {
        const targetRow = rowIndex + r
        while (updated.length <= targetRow) {
          updated.push(makeRow())
        }
        const cells = pastedRows[r]
        let updatedRow = { ...updated[targetRow] }
        for (let c = 0; c < cells.length; c++) {
          const col = PASTE_COLUMNS[colIndex + c]
          if (col) {
            updatedRow = { ...updatedRow, [col]: cells[c].trim() }
          }
        }
        updated[targetRow] = updatedRow
      }
      return updated
    })
  }

  function handleSubmit() {
    const valid = rows.filter(r => r.name.trim())
    if (valid.length === 0) {
      toast.error('Add at least one course name')
      return
    }
    for (const row of valid) {
      send({
        type: 'course:create',
        name: row.name.trim(),
        description: row.description.trim(),
        start: row.start.trim() || null,
        end: row.end.trim() || null,
        coordinator: row.coordinator.trim() || null,
        color: row.color,
      })
    }
    toast.success(`Created ${valid.length} course${valid.length !== 1 ? 's' : ''}`)
    handleOpenChange(false)
  }

  function handleOpenChange(v: boolean) {
    if (!v) setRows(makeRows(5))
    onOpenChange(v)
  }

  const validCount = rows.filter(r => r.name.trim()).length

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[90vw] max-w-5xl">
        <DialogHeader>
          <DialogTitle>Bulk import courses</DialogTitle>
          <DialogDescription>
            Fill in the table below, or paste directly from Excel or Google Sheets. Columns map
            left-to-right: <strong>Name → Description → Start → End → Coordinator</strong>. Start
            and End use the format <strong>year-block</strong> (e.g. <code>2-5</code>).
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-md border">
          {/* Sticky header */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="w-[22%] px-3 py-2 text-left font-medium">
                  Name <span className="text-destructive">*</span>
                </th>
                <th className="w-[26%] px-3 py-2 text-left font-medium">Description</th>
                <th className="w-[10%] px-3 py-2 text-left font-medium">Start</th>
                <th className="w-[10%] px-3 py-2 text-left font-medium">End</th>
                <th className="px-3 py-2 text-left font-medium">Coordinator</th>
                <th className="w-12 px-3 py-2 text-center font-medium">Color</th>
                <th className="w-8" />
              </tr>
            </thead>
          </table>

          {/* Scrollable body */}
          <div className="max-h-[40vh] overflow-y-auto">
            <table className="w-full text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[26%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col />
                <col className="w-12" />
                <col className="w-8" />
              </colgroup>
              <tbody className="divide-y">
                {rows.map((row, i) => (
                  <tr key={i} className="group">
                    <td className="px-2 py-1">
                      <Input
                        value={row.name}
                        onChange={e => updateRow(i, 'name', e.target.value)}
                        onPaste={e => handlePaste(e, i, 0)}
                        placeholder="Course name"
                        className="h-7 border-0 bg-transparent text-sm focus-visible:ring-1"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        value={row.description}
                        onChange={e => updateRow(i, 'description', e.target.value)}
                        onPaste={e => handlePaste(e, i, 1)}
                        placeholder="Optional"
                        className="h-7 border-0 bg-transparent text-sm focus-visible:ring-1"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        value={row.start}
                        onChange={e => updateRow(i, 'start', e.target.value)}
                        onPaste={e => handlePaste(e, i, 2)}
                        placeholder="e.g. 2-5"
                        className="h-7 border-0 bg-transparent text-sm focus-visible:ring-1"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        value={row.end}
                        onChange={e => updateRow(i, 'end', e.target.value)}
                        onPaste={e => handlePaste(e, i, 3)}
                        placeholder="e.g. 4-8"
                        className="h-7 border-0 bg-transparent text-sm focus-visible:ring-1"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        value={row.coordinator}
                        onChange={e => updateRow(i, 'coordinator', e.target.value)}
                        onPaste={e => handlePaste(e, i, 4)}
                        placeholder="Optional"
                        className="h-7 border-0 bg-transparent text-sm focus-visible:ring-1"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex justify-center">
                        <ColorPicker
                          value={row.color}
                          onChange={v => updateRow(i, 'color', v)}
                          shape="square"
                        />
                      </div>
                    </td>
                    <td className="pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                        onClick={() => removeRow(i)}
                        title="Remove row"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-full border border-dashed text-xs text-muted-foreground hover:text-foreground"
          onClick={addRows}
        >
          <Plus className="mr-1 size-3" />
          Add 5 rows
        </Button>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={validCount === 0}>
            Create {validCount > 0 ? validCount : ''} course{validCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
