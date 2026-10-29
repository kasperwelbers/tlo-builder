import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  onShowOverview: () => void
  onShowHelp: () => void
}

/** Shown to visitors who open the project through a public read-only link. */
export function PublicLinkWelcome({
  open,
  onOpenChange,
  projectName,
  onShowOverview,
  onShowHelp,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5 text-muted-foreground" />
            Welcome{projectName ? ` to ${projectName}` : ""}
          </DialogTitle>
          <DialogDescription>
            You're viewing this curriculum through a public, read-only link.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            You can freely explore the trajectories, their learning outcomes
            (TLOs and ILOs), the courses they are taught in, and the exit
            qualifications they contribute to.
          </p>
          <p>
            Nothing can be changed from this view, and internal comments are not
            shown. The content updates live as the curriculum team works on it.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onShowHelp()
            }}
          >
            How this tool works
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onShowOverview()
            }}
          >
            Start with the overview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
