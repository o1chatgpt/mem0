import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

interface ApiKeyErrorAlertProps {
  title?: string
  description?: string
  showSettingsLink?: boolean
}

export function ApiKeyErrorAlert({
  title = "API Key Error",
  description = "There was an issue with your OpenAI API key. Please check your configuration.",
  showSettingsLink = true,
}: ApiKeyErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{description}</p>
        {showSettingsLink && (
          <Link href="/settings" passHref>
            <Button variant="outline" size="sm">
              Go to Settings
            </Button>
          </Link>
        )}
      </AlertDescription>
    </Alert>
  )
}
