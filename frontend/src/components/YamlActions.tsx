import { useRef } from 'react'
import { Upload, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import { exportToYaml, parseYamlForImport } from '@/lib/yamlIO'

export function YamlActions() {
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
    e.target.value = ''   // reset now, before the live FileList can be cleared
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
    <div className="flex gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" size="sm" onClick={handleImportClick}>
        <Upload className="size-4" />
        Import YAML
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="size-4" />
        Export YAML
      </Button>
    </div>
  )
}
