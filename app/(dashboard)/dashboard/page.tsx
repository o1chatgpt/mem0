import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AI_FAMILY_MEMBERS } from "@/lib/data/ai-family"

export default function DashboardPage() {
  // Get a few featured AI family members
  const featuredMembers = AI_FAMILY_MEMBERS.slice(0, 3)

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
      <p className="mb-8 text-lg text-muted-foreground">Welcome to your AI Family Manager</p>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Featured AI Family Members</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{member.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/ai-family/${member.id}`}>Chat with {member.name}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button asChild variant="outline">
            <Link href="/ai-family">View All AI Family Members</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Voice Services</CardTitle>
            <CardDescription>Configure voice settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage voice services and assign voices to your AI family members.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/voice-services">Voice Services</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
            <CardDescription>Manage your tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create and configure tools for your AI family members to use.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/tools">View Tools</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Management</CardTitle>
            <CardDescription>Manage AI memories</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View and manage memories across all AI family members.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/memories">Manage Memories</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
