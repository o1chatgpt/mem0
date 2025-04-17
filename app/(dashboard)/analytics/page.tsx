import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-2 text-3xl font-bold">Analytics</h1>
      <p className="mb-8 text-lg text-muted-foreground">View analytics and insights</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Conversations</CardTitle>
            <CardDescription>Number of conversations with AI family members</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">247</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Memories</CardTitle>
            <CardDescription>Number of memories stored</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1,358</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Number of active users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Usage by AI Family Member</CardTitle>
            <CardDescription>Conversation distribution across AI family members</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
