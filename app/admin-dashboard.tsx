import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mic, CheckSquare } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">AI Family Command Center</h1>

        <form action="/api/logout" method="POST">
          <Button variant="outline">Logout</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              AI Family Members
            </CardTitle>
            <CardDescription>Manage your AI family members</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              Add, edit, or remove AI family members and configure their personalities, roles, and capabilities.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Active Members:</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Voice Enabled:</span>
                <span className="font-medium">4</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/ai-family" className="w-full">
              <Button className="w-full">Manage AI Family</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
            <CardTitle className="flex items-center">
              <Mic className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
              Voice Services
            </CardTitle>
            <CardDescription>Configure voice service providers</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">Set up OpenAI, ElevenLabs, or HUME voice services for your AI family members.</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Default Service:</span>
                <span className="font-medium">OpenAI</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Active Services:</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/voice-services" className="w-full">
              <Button className="w-full">Manage Voice Services</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="flex items-center">
              <CheckSquare className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
              Task Management
            </CardTitle>
            <CardDescription>Assign and monitor AI tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">Create, assign, and track tasks for your AI family members to complete.</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Active Tasks:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Completed Tasks:</span>
                <span className="font-medium">12</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/tasks" className="w-full">
              <Button className="w-full">Manage Tasks</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" asChild>
            <Link href="/ai-family/new">Add AI Family Member</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tasks/new">Create New Task</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/voice-test">Test Voice Services</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tool-designer">Tool Designer</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
