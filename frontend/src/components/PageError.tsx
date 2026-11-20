import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
}

export default function PageError({
  title = "Something went wrong",
  message = "We couldn't load this page. Please try again.",
  onRetry,
  isRetrying = false,
}: PageErrorProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" strokeWidth={1.8} />
        </div>

        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>

        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="outline"
            className="mt-6"
          >
            <RefreshCw
              className={`mr-2 size-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Retrying..." : "Try again"}
          </Button>
        )}
      </div>
    </div>
  )
}
