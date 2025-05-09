import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ApiKeyWarning() {
  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">OpenAI API Key Required</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          Some features require a valid OpenAI API key to function properly. AI-powered insights, predictions, and
          memory analysis may be limited without a valid API key.
        </p>
        <Button asChild variant="outline" className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100">
          <Link href="/api-keys">Add API Key</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
