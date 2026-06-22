import { useMemo, useState } from "react"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Columns3,
  ListFilter,
} from "lucide-react"
import { useApp } from "@/context/AppContext"
import { OrderBadge } from "@/components/ui/order-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Course, Ilo } from "@/lib/types"

// ── Config ────────────────────────────────────────────────────────────────────

type GroupBy = "trajectory" | "eq" | "tlo"
type CourseColId = "name" | "period" | "type" | "owner" | "coordinator"
type SortDir = "asc" | "desc"

interface ColDef {
  id: CourseColId
  label: string
  getValue: (c: Course) => string
}

const COL_DEFS: ColDef[] = [
  { id: "name", label: "Name", getValue: (c) => c.name },
  { id: "period", label: "Period", getValue: (c) => c.start ?? "" },
  { id: "type", label: "Type", getValue: (c) => c.type },
  { id: "owner", label: "Owner", getValue: (c) => c.owner ?? "" },
  {
    id: "coordinator",
    label: "Coordinator",
    getValue: (c) => c.coordinator ?? "",
  },
]

const DEFAULT_COLS = new Set<CourseColId>(["name", "period"])

// ── Helper ────────────────────────────────────────────────────────────────────

function CourseCell({ colId, course }: { colId: CourseColId; course: Course }) {
  const dash = <span className="italic opacity-30">—</span>
  switch (colId) {
    case "name":
      return <span className="text-xs">{course.name || dash}</span>
    case "period": {
      const p = [course.start, course.end].filter(Boolean).join(" → ")
      return (
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {p || dash}
        </span>
      )
    }
    case "type":
      return <span className="text-xs">{course.type || dash}</span>
    case "owner":
      return <span className="text-xs">{course.owner || dash}</span>
    case "coordinator":
      return <span className="text-xs">{course.coordinator || dash}</span>
    default:
      return null
  }
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-0.5 opacity-25">↕</span>
  return active && dir === "asc" ? (
    <ChevronUp className="ml-0.5 inline size-3" />
  ) : (
    <ChevronDown className="ml-0.5 inline size-3" />
  )
}

function FilterButton({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onChange: (next: Set<string>) => void
}) {
  const active = selected.size > 0
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({
            variant: active ? "secondary" : "outline",
            size: "sm",
          }),
          "h-7 gap-1.5 text-xs"
        )}
      >
        <ListFilter className="size-3.5" />
        {label}
        {active && (
          <span className="text-muted-foreground">({selected.size})</span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-1">
        {options.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-muted-foreground italic">
            No values found
          </p>
        ) : (
          <>
            {options.map((opt) => {
              const on = selected.has(opt)
              return (
                <button
                  key={opt}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent"
                  onClick={() => {
                    const next = new Set(selected)
                    on ? next.delete(opt) : next.add(opt)
                    onChange(next)
                  }}
                >
                  <div
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded border",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {on && <Check className="size-2.5" />}
                  </div>
                  <span className="truncate">{opt}</span>
                </button>
              )
            })}
            {active && (
              <button
                className="mt-0.5 flex w-full items-center gap-2 rounded border-t px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent"
                onClick={() => onChange(new Set())}
              >
                Clear filter
              </button>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface SelectedCell {
  courseId: number
  dataColId: number
}

export function OverviewPage() {
  const { state } = useApp()

  const [groupBy, setGroupBy] = useState<GroupBy>("trajectory")
  const [activeCols, setActiveCols] = useState<Set<CourseColId>>(
    new Set(DEFAULT_COLS)
  )
  const [sortCol, setSortCol] = useState<CourseColId>("period")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set())
  const [filterOwners, setFilterOwners] = useState<Set<string>>(new Set())

  // ── Lookups ─────────────────────────────────────────────────────────────────
  const iloById = useMemo(
    () => new Map(state.ilos.map((i) => [i.id, i])),
    [state.ilos]
  )
  const tloById = useMemo(
    () => new Map(state.tlos.map((t) => [t.id, t])),
    [state.tlos]
  )
  const trajectoryById = useMemo(
    () => new Map(state.trajectories.map((t) => [t.id, t])),
    [state.trajectories]
  )
  const eqById = useMemo(
    () => new Map(state.exitQualifications.map((e) => [e.id, e])),
    [state.exitQualifications]
  )

  // ── Sorted trajectories ──────────────────────────────────────────────────────
  const sortedTrajectories = useMemo(
    () =>
      [...state.trajectories].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      ),
    [state.trajectories]
  )

  // ── Data columns by mode ─────────────────────────────────────────────────────
  const dataColsTrajectory = useMemo(
    () =>
      sortedTrajectories.filter((t) =>
        state.tlos.some((tlo) => tlo.trajectoryId === t.id)
      ),
    [sortedTrajectories, state.tlos]
  )

  const dataColsEq = useMemo(
    () =>
      [...state.exitQualifications]
        .filter((eq) => state.tlos.some((t) => t.eqId === eq.id))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        ),
    [state.exitQualifications, state.tlos]
  )

  // TLOs grouped by trajectory (for two-level header)
  const tloGroups = useMemo(() => {
    return sortedTrajectories
      .map((traj) => ({
        trajectory: traj,
        tlos: state.tlos
          .filter((t) => t.trajectoryId === traj.id)
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
          ),
      }))
      .filter((g) => g.tlos.length > 0)
  }, [sortedTrajectories, state.tlos])

  const dataColsTlo = useMemo(
    () => tloGroups.flatMap((g) => g.tlos),
    [tloGroups]
  )

  // ── Cell ILO map (all three modes computed together) ─────────────────────────
  // Keys: "t:{courseId}:{trajectoryId}", "e:{courseId}:{eqId}", "l:{courseId}:{tloId}"
  const allCellIlos = useMemo(() => {
    const result = new Map<string, Ilo[]>()

    for (const m of state.iloCurrentIloMappings) {
      const ilo = iloById.get(m.iloId)
      if (!ilo || ilo.tloId === null) continue
      const tlo = tloById.get(ilo.tloId)
      if (!tlo) continue

      const cid = m.courseId

      const addTo = (key: string) => {
        const arr = result.get(key) ?? []
        if (!arr.some((i) => i.id === ilo.id)) arr.push(ilo)
        result.set(key, arr)
      }

      addTo(`t:${cid}:${tlo.trajectoryId}`)
      if (tlo.eqId !== null) addTo(`e:${cid}:${tlo.eqId}`)
      addTo(`l:${cid}:${ilo.tloId}`)
    }
    return result
  }, [state.iloCurrentIloMappings, iloById, tloById])

  const cellKey = (courseId: number, dataColId: number) => {
    const p = groupBy === "trajectory" ? "t" : groupBy === "eq" ? "e" : "l"
    return `${p}:${courseId}:${dataColId}`
  }

  // ── Filter options ──────────────────────────────────────────────────────────
  const uniqueTypes = useMemo(
    () =>
      [...new Set(state.courses.map((c) => c.type).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, undefined, { numeric: true })
      ),
    [state.courses]
  )
  const uniqueOwners = useMemo(
    () =>
      [
        ...new Set(state.courses.map((c) => c.owner ?? "").filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [state.courses]
  )

  // ── Sorted courses ───────────────────────────────────────────────────────────
  const sortedCourses = useMemo(() => {
    const def = COL_DEFS.find((c) => c.id === sortCol)
    return [...state.courses].sort((a, b) => {
      const av = def ? def.getValue(a) : a.code
      const bv = def ? def.getValue(b) : b.code
      const primary = av.localeCompare(bv, undefined, { numeric: true })
      const secondary = a.code.localeCompare(b.code, undefined, {
        numeric: true,
      })
      const cmp = primary !== 0 ? primary : secondary
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [state.courses, sortCol, sortDir])

  function toggleSort(col: CourseColId) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortCol(col)
      setSortDir("asc")
    }
  }

  // ── Displayed courses (filtered) ─────────────────────────────────────────────
  const displayedCourses = useMemo(() => {
    let result = sortedCourses
    if (filterTypes.size > 0)
      result = result.filter((c) => filterTypes.has(c.type))
    if (filterOwners.size > 0)
      result = result.filter((c) => filterOwners.has(c.owner ?? ""))
    return result
  }, [sortedCourses, filterTypes, filterOwners])

  // ── Active columns list ──────────────────────────────────────────────────────
  const activeColList = COL_DEFS.filter((c) => activeCols.has(c.id))

  // ── Current data columns ─────────────────────────────────────────────────────
  const currentDataCols = useMemo(() => {
    if (groupBy === "trajectory")
      return dataColsTrajectory.map((t, i) => ({
        id: t.id,
        label: t.name,
        color: t.color,
        badge: String.fromCharCode(65 + i),
      }))
    if (groupBy === "eq")
      return dataColsEq.map((e) => ({
        id: e.id,
        label: e.name,
        color: undefined,
        badge: "",
      }))
    return dataColsTlo.map((t) => ({
      id: t.id,
      label: t.name,
      color: trajectoryById.get(t.trajectoryId)?.color,
      badge: "",
    }))
  }, [groupBy, dataColsTrajectory, dataColsEq, dataColsTlo, trajectoryById])

  // ── Dialog data ──────────────────────────────────────────────────────────────
  const selectedIlos = selectedCell
    ? (allCellIlos.get(
        cellKey(selectedCell.courseId, selectedCell.dataColId)
      ) ?? [])
    : []
  const selectedCourse = selectedCell
    ? state.courses.find((c) => c.id === selectedCell.courseId)
    : null
  const selectedColColor = selectedCell
    ? groupBy === "trajectory"
      ? trajectoryById.get(selectedCell.dataColId)?.color
      : groupBy === "tlo"
        ? trajectoryById.get(
            tloById.get(selectedCell.dataColId)?.trajectoryId ?? -1
          )?.color
        : undefined
    : undefined
  const selectedColLabel = selectedCell
    ? ((groupBy === "trajectory"
        ? trajectoryById.get(selectedCell.dataColId)?.name
        : groupBy === "eq"
          ? eqById.get(selectedCell.dataColId)?.name
          : tloById.get(selectedCell.dataColId)?.name) ?? "—")
    : ""

  // ── Empty state ──────────────────────────────────────────────────────────────
  const empty = state.courses.length === 0 || currentDataCols.length === 0

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col gap-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Matrix of courses vs.{" "}
          {groupBy === "trajectory"
            ? "trajectories"
            : groupBy === "eq"
              ? "exit qualifications"
              : "TLOs"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Group by */}
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 text-xs text-muted-foreground">
            Group by:
          </span>
          <div className="flex overflow-hidden rounded-md border text-xs">
            {(["trajectory", "eq", "tlo"] as GroupBy[]).map((mode, i) => (
              <button
                key={mode}
                onClick={() => {
                  setGroupBy(mode)
                  setSelectedCell(null)
                }}
                className={cn(
                  "px-2.5 py-1 transition-colors",
                  i > 0 && "border-l",
                  groupBy === mode
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {mode === "trajectory"
                  ? "Trajectory"
                  : mode === "eq"
                    ? "Exit Qualification"
                    : "TLO"}
              </button>
            ))}
          </div>
        </div>

        {/* Column picker */}
        <Popover>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-7 gap-1.5 text-xs"
            )}
          >
            <Columns3 className="size-3.5" />
            Columns
            {activeCols.size > 0 && (
              <span className="text-muted-foreground">({activeCols.size})</span>
            )}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-44 p-1">
            {COL_DEFS.map((col) => {
              const on = activeCols.has(col.id)
              return (
                <button
                  key={col.id}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent"
                  onClick={() => {
                    const next = new Set(activeCols)
                    on ? next.delete(col.id) : next.add(col.id)
                    setActiveCols(next)
                  }}
                >
                  <div
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded border",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {on && <Check className="size-2.5" />}
                  </div>
                  {col.label}
                </button>
              )
            })}
          </PopoverContent>
        </Popover>

        {/* Filter separator */}
        <span className="h-4 w-px bg-border" />

        {/* Type filter */}
        <FilterButton
          label="Type"
          options={uniqueTypes}
          selected={filterTypes}
          onChange={setFilterTypes}
        />

        {/* Owner filter */}
        <FilterButton
          label="Owner"
          options={uniqueOwners}
          selected={filterOwners}
          onChange={setFilterOwners}
        />
      </div>

      {/* Empty state */}
      {empty ? (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground italic">
            {state.courses.length === 0
              ? "Add courses to see the overview."
              : groupBy === "eq"
                ? "No exit qualifications are linked to TLOs yet."
                : "Add trajectories with TLOs to see the overview."}
          </p>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-auto rounded-md border">
            <table
              className="border-collapse text-sm"
              style={{ minWidth: "100%" }}
            >
              <thead>
                {groupBy === "tlo" ? (
                  // Two-level header for TLO mode
                  <>
                    <tr>
                      <th
                        rowSpan={2}
                        className="sticky left-0 z-20 border-r border-b bg-card px-3 py-2 text-left align-bottom"
                        style={{ minWidth: 120 }}
                      >
                        <span className="text-xs font-semibold text-muted-foreground">
                          Code
                        </span>
                      </th>
                      {activeColList.map((col) => (
                        <th
                          key={col.id}
                          rowSpan={2}
                          className="cursor-pointer border-r border-b bg-card px-3 py-2 text-left align-bottom select-none hover:bg-muted/50"
                          style={{ minWidth: 90 }}
                          onClick={() => toggleSort(col.id)}
                        >
                          <span className="text-xs font-semibold text-muted-foreground">
                            {col.label}
                            <SortIndicator
                              active={sortCol === col.id}
                              dir={sortDir}
                            />
                          </span>
                        </th>
                      ))}
                      {tloGroups.map((g) => (
                        <th
                          key={g.trajectory.id}
                          colSpan={g.tlos.length}
                          className="border-r border-b bg-card px-3 py-2 text-center"
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className="size-2 shrink-0 rounded-full"
                              style={{ backgroundColor: g.trajectory.color }}
                            />
                            <span className="text-xs font-semibold">
                              {g.trajectory.name}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {dataColsTlo.map((tlo) => (
                        <th
                          key={tlo.id}
                          className="border-r border-b bg-card px-2 py-2 text-center"
                          style={{ minWidth: 72 }}
                        >
                          <span className="text-xs font-medium">
                            {tlo.name}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </>
                ) : (
                  // Single-level header for trajectory / eq modes
                  <tr>
                    <th
                      className="sticky left-0 z-20 border-r border-b bg-card px-3 py-2 text-left"
                      style={{ minWidth: 120 }}
                    >
                      <span className="text-xs font-semibold text-muted-foreground">
                        Code
                      </span>
                    </th>
                    {activeColList.map((col) => (
                      <th
                        key={col.id}
                        className="cursor-pointer border-r border-b bg-card px-3 py-2 text-left select-none hover:bg-muted/50"
                        style={{ minWidth: 90 }}
                        onClick={() => toggleSort(col.id)}
                      >
                        <span className="text-xs font-semibold text-muted-foreground">
                          {col.label}
                          <SortIndicator
                            active={sortCol === col.id}
                            dir={sortDir}
                          />
                        </span>
                      </th>
                    ))}
                    {currentDataCols.map((col, i) => (
                      <th
                        key={col.id}
                        className="border-r border-b bg-card px-3 py-3 text-center"
                        style={{ minWidth: 80 }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {col.color ? (
                            <OrderBadge
                              label={col.badge || String.fromCharCode(65 + i)}
                              color={col.color}
                              shape="circle"
                            />
                          ) : null}
                          <span className="text-xs leading-tight font-semibold">
                            {col.label}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                )}
              </thead>

              <tbody className="divide-y">
                {displayedCourses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        1 + activeColList.length + currentDataCols.length
                      }
                      className="py-12 text-center text-sm text-muted-foreground italic"
                    >
                      No courses match the current filters.
                    </td>
                  </tr>
                ) : (
                  displayedCourses.map((course, ci) => (
                    <tr key={course.id} className="group">
                      {/* Sticky code */}
                      <td className="sticky left-0 z-10 border-r bg-card px-3 py-2 group-hover:bg-muted/40">
                        <div className="flex items-center gap-2">
                          <OrderBadge
                            label={String(ci + 1)}
                            color={course.color}
                            shape="square"
                          />
                          <span className="truncate text-xs font-medium">
                            {course.code}
                          </span>
                        </div>
                      </td>

                      {/* Optional course columns */}
                      {activeColList.map((col) => (
                        <td
                          key={col.id}
                          className="border-r bg-card px-3 py-2 group-hover:bg-muted/40"
                        >
                          <CourseCell colId={col.id} course={course} />
                        </td>
                      ))}

                      {/* Data cells */}
                      {currentDataCols.map((dcol) => {
                        const ilos =
                          allCellIlos.get(cellKey(course.id, dcol.id)) ?? []
                        const count = ilos.length
                        const isSelected =
                          selectedCell?.courseId === course.id &&
                          selectedCell?.dataColId === dcol.id
                        return (
                          <td
                            key={dcol.id}
                            className={cn(
                              "border-r px-2 py-2 text-center transition-colors",
                              isSelected
                                ? "bg-muted/60"
                                : "group-hover:bg-muted/20"
                            )}
                          >
                            {count > 0 ? (
                              <button
                                onClick={() =>
                                  setSelectedCell({
                                    courseId: course.id,
                                    dataColId: dcol.id,
                                  })
                                }
                                className={cn(
                                  "mx-auto inline-flex size-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm transition-all hover:scale-110 hover:shadow-md",
                                  isSelected && "scale-110 ring-2 ring-offset-2"
                                )}
                                style={{
                                  backgroundColor: dcol.color ?? "#94a3b8",
                                  // @ts-ignore
                                  "--tw-ring-color": dcol.color ?? "#94a3b8",
                                }}
                                title={`${count} ILO${count !== 1 ? "s" : ""} — click to expand`}
                              >
                                {count}
                              </button>
                            ) : (
                              <span className="text-base text-muted-foreground/25 select-none">
                                ·
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Cell detail dialog */}
          <Dialog
            open={!!selectedCell}
            onOpenChange={(open) => !open && setSelectedCell(null)}
          >
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-base leading-snug">
                  ILOs in{" "}
                  <span>
                    {selectedCourse?.code}
                    {selectedCourse?.name ? ` — ${selectedCourse.name}` : ""}
                  </span>{" "}
                  covered by{" "}
                  <span style={{ color: selectedColColor }}>
                    {selectedColLabel}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {selectedIlos.length} ILO
                  {selectedIlos.length !== 1 ? "s" : ""} matched
                </DialogDescription>
              </DialogHeader>

              {selectedIlos.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground italic">
                  No ILOs for this combination.
                </p>
              ) : (
                <ul className="mt-2 max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
                  {selectedIlos.map((ilo) => (
                    <li key={ilo.id} className="flex gap-2.5 text-sm">
                      <span
                        className="mt-1.5 size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: selectedColColor ?? "#64748b",
                        }}
                      />
                      <span
                        className={cn(
                          !ilo.description && "text-muted-foreground italic"
                        )}
                      >
                        {ilo.description || "No description"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
