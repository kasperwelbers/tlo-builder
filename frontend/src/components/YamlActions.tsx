import { useRef, useState } from "react"
import { Upload, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useApp } from "@/context/AppContext"
import { exportToYaml, parseYamlForImport } from "@/lib/yamlIO"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface YamlActionsProps {
  collapsed?: boolean
  projectName: string
}

export function YamlActions({
  collapsed = false,
  projectName,
}: YamlActionsProps) {
  const { state, send } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleExport() {
    exportToYaml(state, projectName)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileArray = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (fileArray.length === 0) return
    setPendingFiles(fileArray)
    setConfirmOpen(true)
  }

  async function handleConfirmImport() {
    setConfirmOpen(false)
    const fileArray = pendingFiles
    setPendingFiles([])

    let count = 0
    const errors: string[] = []

    for (const file of fileArray) {
      try {
        const text = await file.text()
        const parsed = parseYamlForImport(text)
        send({ type: "import:all", data: parsed })
        count++
      } catch (err) {
        errors.push(file.name)
        console.error(err)
      }
    }

    if (errors.length > 0) {
      toast.error(`Failed to import: ${errors.join(", ")}`)
    } else {
      toast.success(`Imported ${count} file${count !== 1 ? "s" : ""}`)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite project data?</AlertDialogTitle>
            <AlertDialogDescription>
              Importing will <strong>permanently replace</strong> all
              trajectories, courses, TLOs, ILOs, and Current ILOs in this
              project with the contents of the file. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingFiles([])}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              Yes, overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        className={
          collapsed ? "flex flex-col items-center gap-1" : "flex gap-1.5"
        }
      >
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleImportClick}
                >
                  <Upload className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Import YAML</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleExport}
                >
                  <Download className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Export YAML</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 flex-1 gap-1 text-xs"
              onClick={handleImportClick}
            >
              <Upload className="size-3" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 flex-1 gap-1 text-xs"
              onClick={handleExport}
            >
              <Download className="size-3" />
              Export
            </Button>
          </>
        )}
      </div>
    </>
  )
}
