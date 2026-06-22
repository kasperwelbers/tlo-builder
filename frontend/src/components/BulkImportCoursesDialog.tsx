import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { ColorPicker } from "@/components/ui/color-picker"
import { useApp } from "@/context/AppContext"
import { randomColor } from "@/lib/colorPalette"

interface Row {
  code: string
  name: string
  start: string
  end: string
  coordinator: string
  level: string
  ec: string
  type: string
  owner: string
  currentIlo: string
  color: string
}

function makeRow(): Row {
  return {
    code: "",
    name: "",
    start: "",
    end: "",
    coordinator: "",
    level: "",
    ec: "",
    type: "",
    owner: "",
    currentIlo: "",
    color: randomColor(),
  }
}

function makeRows(n: number): Row[] {
  return Array.from({ length: n }, makeRow)
}

// Parses TSV from Excel / Google Sheets clipboard data.
// Cells containing tabs, newlines, or quotes are wrapped in double-quotes by
// the spreadsheet app; double-quotes inside are escaped as "".  A bare \n
// only ends a row when we are *outside* a quoted field.
function parseTsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++ // skip the escaped second quote
      } else if (ch === '"') {
        inQuotes = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === "\t") {
        row.push(field)
        field = ""
      } else if (ch === "\r") {
        // ignore — \r\n line endings from Windows/Excel
      } else if (ch === "\n") {
        row.push(field)
        rows.push(row)
        field = ""
        row = []
      } else {
        field += ch
      }
    }
  }

  // flush the last field / row (no trailing newline)
  row.push(field)
  if (row.some((f) => f.trim())) rows.push(row)

  return rows
}

const PASTE_COLUMNS: (keyof Omit<Row, "color">)[] = [
  "code",
  "name",
  "start",
  "end",
  "coordinator",
  "level",
  "ec",
  "type",
  "owner",
  "currentIlo",
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkImportCoursesDialog({ open, onOpenChange }: Props) {
  const { send } = useApp()
  const [rows, setRows] = useState<Row[]>(() => makeRows(10))

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    )
  }

  function addRows() {
    setRows((prev) => [...prev, ...makeRows(10)])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  function handlePaste(
    e: React.ClipboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) {
    const text = e.clipboardData.getData("text/plain")
    if (!text.includes("\t") && !text.includes("\n")) return
    e.preventDefault()

    const pastedRows = parseTsv(text)

    setRows((prev) => {
      const updated = [...prev]
      for (let r = 0; r < pastedRows.length; r++) {
        const targetRow = rowIndex + r
        while (updated.length <= targetRow) updated.push(makeRow())
        const cells = pastedRows[r]
        let next = { ...updated[targetRow] }
        for (let c = 0; c < cells.length; c++) {
          const col = PASTE_COLUMNS[colIndex + c]
          if (col) next = { ...next, [col]: cells[c].trim() }
        }
        updated[targetRow] = next
      }
      return updated
    })
  }

  function handleSubmit() {
    const validRows = rows.filter((r) => r.code.trim())
    if (validRows.length === 0) {
      toast.error("Add at least one course code")
      return
    }

    // Group rows by course code — first row wins for course metadata
    const courseMap = new Map<
      string,
      {
        code: string
        name: string
        start: string | null
        end: string | null
        coordinator: string | null
        level: number | null
        ec: number | null
        type: string
        owner: string | null
        color: string
        // snake_case key matches what the backend handler reads
        current_ilos: string[]
      }
    >()

    for (const row of validRows) {
      const code = row.code.trim()
      if (!courseMap.has(code)) {
        courseMap.set(code, {
          code,
          name: row.name.trim(),
          start: row.start.trim() || null,
          end: row.end.trim() || null,
          coordinator: row.coordinator.trim() || null,
          level: row.level.trim() ? Number(row.level.trim()) : null,
          ec: row.ec.trim() ? Number(row.ec.trim()) : null,
          type: row.type.trim(),
          owner: row.owner.trim() || null,
          color: row.color,
          current_ilos: [],
        })
      }
      const currentIloText = row.currentIlo.trim()
      if (currentIloText) courseMap.get(code)!.current_ilos.push(currentIloText)
    }

    const courseList = Array.from(courseMap.values())
    send({ type: "course:bulk_create", courses: courseList })

    const courseCount = courseList.length
    const currentIloCount = courseList.reduce(
      (n, c) => n + c.current_ilos.length,
      0
    )
    toast.success(
      currentIloCount > 0
        ? `Importing ${courseCount} course${courseCount !== 1 ? "s" : ""} with ${currentIloCount} objective${currentIloCount !== 1 ? "s" : ""}`
        : `Importing ${courseCount} course${courseCount !== 1 ? "s" : ""}`
    )
    handleOpenChange(false)
  }

  function handleOpenChange(v: boolean) {
    if (!v) setRows(makeRows(10))
    onOpenChange(v)
  }

  const uniqueCourseCodes = new Set(
    rows.map((r) => r.code.trim()).filter(Boolean)
  )
  const uniqueCount = uniqueCourseCodes.size
  const currentIloCount = rows.filter(
    (r) => uniqueCourseCodes.has(r.code.trim()) && r.currentIlo.trim()
  ).length

  const cellCls = "border-r p-0 last:border-r-0"
  const inputCls =
    "h-8 w-full rounded-none border-0 bg-transparent px-2 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring/50 placeholder:text-muted-foreground/40"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex w-[90vw] flex-col gap-3 p-4 sm:max-w-6xl">
        <DialogHeader className="gap-1">
          <DialogTitle>Manage courses</DialogTitle>
          <DialogDescription className="space-y-1 text-xs">
            <span className="block">
              Paste from a spreadsheet — columns map left-to-right:{" "}
              <span className="font-medium text-foreground">
                Code · Name · Start · End · Coordinator · Level · EC · Type ·
                Owner · Course objective
              </span>
              . Repeat a code on multiple rows to attach several objectives to
              one course. Start / End format:{" "}
              <span className="font-medium text-foreground">year-block</span>{" "}
              (e.g. 2-5). Existing courses are updated; new ones are added.
            </span>
            <span className="block text-amber-600 dark:text-amber-400">
              Objectives are matched by text — existing ones are left untouched;
              only new texts are added.
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Table — horizontal + vertical scroll */}
        <div className="max-h-[55vh] overflow-auto rounded border">
          <table
            className="w-full border-collapse text-xs"
            style={{ minWidth: 1300 }}
          >
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted text-muted-foreground">
                <th
                  className="border-r border-b px-2 py-1.5 text-left font-medium"
                  style={{ width: 120 }}
                >
                  Code <span className="text-destructive">*</span>
                </th>
                <th
                  className="border-r border-b px-2 py-1.5 text-left font-medium"
                  style={{ width: 220 }}
                >
                  Name
                </th>
                <th
                  className="border-r border-b px-2 py-1.5 text-left font-medium"
                  style={{ width: 72 }}
                >
                  Start
                </th>
                <th
                  className="border-r border-b px-2 py-1.5 text-left font-medium"
                  style={{ width: 72 }}
                >
                  End
                </th>
                <th
                  className="border-r border-b px-2 py-1.5 text-left font-medium"
                  style={{ width: 150 }}
                >
                  Coordinator
                </th>
                <th
                  className="border-r border-b px-2 py-1.5 text-left font-medium"
                  style={{ width: 60 }}
                >
                  Level
                </th>
                <th
                  className="border-r border-b px-2 py-1.5 text-left font-medium"
                  style={{ width: 60 }}
                >
                  EC
                </th>
                <th
                  className="border-r border-b px-2 py-1.5 text-left font-medium"
                  style={{ width: 120 }}
                >
                  Type
                </th>
                <th
                  className="border-r border-b px-2 py-1.5 text-left font-medium"
                  style={{ width: 130 }}
                >
                  Owner
                </th>
                <th className="border-r border-b px-2 py-1.5 text-left font-medium">
                  Course objective
                </th>
                <th
                  className="bg-background px-2 py-1.5 text-center font-medium"
                  style={{ width: 44 }}
                ></th>
                <th
                  className="bg-background px-1 py-1.5"
                  style={{ width: 28 }}
                />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isDupe =
                  row.code.trim() &&
                  uniqueCourseCodes.has(row.code.trim()) &&
                  rows.findIndex((r) => r.code.trim() === row.code.trim()) !== i
                return (
                  <tr
                    key={i}
                    className={`group ${isDupe ? "bg-muted/30" : "hover:bg-muted/20"}`}
                  >
                    <td className={cellCls}>
                      <Input
                        value={row.code}
                        onChange={(e) => updateRow(i, "code", e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 0)}
                        placeholder="e.g. CS101"
                        className={inputCls}
                      />
                    </td>
                    <td className={cellCls}>
                      <Input
                        value={row.name}
                        onChange={(e) => updateRow(i, "name", e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 1)}
                        placeholder="Full course name"
                        className={inputCls}
                      />
                    </td>
                    <td className={cellCls}>
                      <Input
                        value={row.start}
                        onChange={(e) => updateRow(i, "start", e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 2)}
                        placeholder="2-1"
                        className={inputCls}
                      />
                    </td>
                    <td className={cellCls}>
                      <Input
                        value={row.end}
                        onChange={(e) => updateRow(i, "end", e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 3)}
                        placeholder="4-6"
                        className={inputCls}
                      />
                    </td>
                    <td className={cellCls}>
                      <Input
                        value={row.coordinator}
                        onChange={(e) =>
                          updateRow(i, "coordinator", e.target.value)
                        }
                        onPaste={(e) => handlePaste(e, i, 4)}
                        placeholder="—"
                        className={inputCls}
                      />
                    </td>
                    <td className={cellCls}>
                      <Input
                        value={row.level}
                        onChange={(e) => updateRow(i, "level", e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 5)}
                        placeholder="3"
                        className={inputCls}
                      />
                    </td>
                    <td className={cellCls}>
                      <Input
                        value={row.ec}
                        onChange={(e) => updateRow(i, "ec", e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 6)}
                        placeholder="6"
                        className={inputCls}
                      />
                    </td>
                    <td className={cellCls}>
                      <Input
                        value={row.type}
                        onChange={(e) => updateRow(i, "type", e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 7)}
                        placeholder="—"
                        className={inputCls}
                      />
                    </td>
                    <td className={cellCls}>
                      <Input
                        value={row.owner}
                        onChange={(e) => updateRow(i, "owner", e.target.value)}
                        onPaste={(e) => handlePaste(e, i, 8)}
                        placeholder="—"
                        className={inputCls}
                      />
                    </td>
                    <td className={cellCls}>
                      <Input
                        value={row.currentIlo}
                        onChange={(e) =>
                          updateRow(i, "currentIlo", e.target.value)
                        }
                        onPaste={(e) => handlePaste(e, i, 9)}
                        placeholder="The student can…"
                        className={inputCls}
                      />
                    </td>
                    <td className="">
                      <div className="flex h-8 items-center justify-center">
                        <ColorPicker
                          value={row.color}
                          onChange={(v) => updateRow(i, "color", v)}
                          shape="square"
                        />
                      </div>
                    </td>
                    <td className="p-0">
                      <button
                        onClick={() => removeRow(i)}
                        className="flex h-8 w-full items-center justify-center text-muted-foreground/30 opacity-0 transition-colors group-hover:opacity-100 hover:text-destructive"
                        title="Remove row"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={addRows}
            className="flex items-center gap-1 rounded border border-dashed px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <Plus className="size-3" />
            Add 10 rows
          </button>
          {uniqueCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {uniqueCount} course{uniqueCount !== 1 ? "s" : ""}
              {currentIloCount > 0 &&
                `, ${currentIloCount} objective${currentIloCount !== 1 ? "s" : ""}`}
            </span>
          )}
        </div>

        <DialogFooter className="mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={uniqueCount === 0}>
            Import
            {uniqueCount > 0
              ? ` ${uniqueCount} course${uniqueCount !== 1 ? "s" : ""}`
              : ""}
            {currentIloCount > 0
              ? ` + ${currentIloCount} objective${currentIloCount !== 1 ? "s" : ""}`
              : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
