import { NextResponse } from "next/server"
import { createWorkflow, getUserWorkflows } from "@/lib/crewai/crewai-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const workflows = await getUserWorkflows(Number.parseInt(userId))

    return NextResponse.json({ workflows })
  } catch (error) {
    console.error("Error fetching workflows:", error)
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.creator_id) {
      return NextResponse.json({ error: "Name and creator_id are required" }, { status: 400 })
    }

    const workflow = await createWorkflow(body)

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("Error creating workflow:", error)
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 })
  }
}
