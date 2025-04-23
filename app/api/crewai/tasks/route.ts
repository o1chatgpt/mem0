import { NextResponse } from "next/server"
import { createTask, getReadyTasks } from "@/lib/crewai/crewai-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    if (status === "ready") {
      const tasks = await getReadyTasks()
      return NextResponse.json({ tasks })
    }

    return NextResponse.json({ error: "Invalid status parameter" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title || !body.workflow_id || !body.creator_id) {
      return NextResponse.json({ error: "Title, workflow_id, and creator_id are required" }, { status: 400 })
    }

    const task = await createTask(body)

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
