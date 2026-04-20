import { useRef } from 'react'
import { Upload, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { exportToYaml, parseYamlForImport } from '@/lib/yamlIO'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface YamlActionsProps {
  collapsed?: boolean
}

export function YamlActions({ collapsed = false }: YamlActionsProps) {
  const { state, send } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    exportToYaml(state)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileArray = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (fileArray.length === 0) return

    let count = 0
    const errors: string[] = []

    for (const file of fileArray) {
      try {
        const text = await file.text()
        const parsed = parseYamlForImport(text)
        send({ type: 'import:all', data: parsed })
        count++
      } catch (err) {
        errors.push(file.name)
        console.error(err)
      }
    }

    if (errors.length > 0) {
      toast.error(`Failed to import: ${errors.join(', ')}`)
    } else {
      toast.success(`Imported ${count} file${count !== 1 ? 's' : ''}`)
    }
  }

  return (
    <div className={collapsed ? "flex flex-col items-center gap-1" : "flex gap-1.5"}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {collapsed ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" onClick={handleImportClick}>
                <Upload className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Import YAML</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" onClick={handleExport}>
                <Download className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Export YAML</TooltipContent>
          </Tooltip>
        </>
      ) : (
        <>
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={handleImportClick}>
            <Upload className="size-3" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={handleExport}>
            <Download className="size-3" />
            Export
          </Button>
        </>
      )}
    </div>
  )
}
