import { NextResponse } from "next/server"
import { getWorkflow } from "@/lib/crewai/crewai-service"
import { createServerClient } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const workflow = await getWorkflow(params.id)

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    // Check if workflow can be paused
    if (workflow.status !== "active") {
      return NextResponse.json({ error: "Only active workflows can be paused" }, { status: 400 })
    }

    // Update workflow status to paused
    const supabase = createServerClient()
    const { error } = await supabase
      .from("fm_crew_workflows")
      .update({
        status: "paused",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      console.error("Error pausing workflow:", error)
      return NextResponse.json({ error: "Failed to pause workflow" }, { status: 500 })
    }

    // Update in-progress tasks to pending
    const { error: tasksError } = await supabase
      .from("fm_crew_tasks")
      .update({
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("workflow_id", params.id)
      .eq("status", "in_progress")

    if (tasksError) {
      console.error("Error updating tasks:", tasksError)
      // Continue anyway
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error pausing workflow:", error)
    return NextResponse.json({ error: "Failed to pause workflow" }, { status: 500 })
  }
}
