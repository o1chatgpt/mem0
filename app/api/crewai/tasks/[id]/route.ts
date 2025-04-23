import { NextResponse } from "next/server"
import { updateTaskStatus } from "@/lib/crewai/crewai-service"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    if (!body.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const task = await updateTaskStatus(params.id, body.status, body.output_data)

    if (!task) {
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
