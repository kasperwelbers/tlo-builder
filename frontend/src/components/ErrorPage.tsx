import { Button } from "@/components/ui/button"

interface Props {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorPage({
  title = "Something went wrong",
  message = "Something went wrong on the server. You're still logged in — try again.",
  onRetry,
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex w-full max-w-sm flex-col gap-6 px-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex flex-col gap-2">
          {onRetry && (
            <Button className="w-full" onClick={onRetry}>
              Try again
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </div>
      </div>
    </div>
  )
}
