import { ApiKeyManager } from "@/components/api-key-manager"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Key } from "lucide-react"
import Link from "next/link"

export default function ApiKeysPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">API Key Management</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>OpenAI API Key Required</AlertTitle>
        <AlertDescription>
          To use the AI features of this application, you need to add an OpenAI API key. You can get one from{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            OpenAI's website
          </a>
          .
        </AlertDescription>
      </Alert>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              Quick Setup Guide
            </CardTitle>
            <CardDescription>Follow these steps to set up your OpenAI API key</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  OpenAI's API Keys page
                </a>
              </li>
              <li>Sign in or create an account if you don't have one</li>
              <li>Click on "Create new secret key"</li>
              <li>Give your key a name (e.g., "File Manager App")</li>
              <li>Copy the generated API key</li>
              <li>Add it below using the "Add API Key" button</li>
              <li>Make sure to select "openai" as the service</li>
            </ol>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> OpenAI API keys are not free to use. You will be charged based on your usage.
                Make sure to check{" "}
                <a href="https://openai.com/pricing" target="_blank" rel="noopener noreferrer" className="underline">
                  OpenAI's pricing
                </a>{" "}
                for more information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ApiKeyManager />

      <div className="mt-6 flex justify-end">
        <Link href="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
