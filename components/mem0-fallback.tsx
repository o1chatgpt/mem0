import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function Mem0Fallback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Service Unavailable</CardTitle>
        <CardDescription>The Mem0 memory service is currently unavailable or not properly configured.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertTitle>Using Mock Data</AlertTitle>
          <AlertDescription>
            The application is currently using mock data because it cannot connect to the Mem0 API. This is expected
            during development or if the API is not properly configured.
          </AlertDescription>
        </Alert>

        <p className="mb-4">To fix this issue, please ensure that:</p>

        <ol className="list-decimal pl-5 space-y-2">
          <li>The Mem0 API is running and accessible</li>
          <li>Your API key is correctly set in the environment variables</li>
          <li>The API URL is correctly configured</li>
          <li>Your network allows connections to the API endpoint</li>
        </ol>

        <p className="mt-4">In the meantime, the application will continue to function with mock data.</p>
      </CardContent>
    </Card>
  )
}
