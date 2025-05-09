import { NextResponse } from "next/server"
import { getWorkflow, updateTaskStatus } from "@/lib/crewai/crewai-service"
import { createServerClient } from "@/lib/db"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const workflow = await getWorkflow(params.id)

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    // Check if workflow can be started
    if (workflow.status !== "draft" && workflow.status !== "waiting_approval") {
      return NextResponse.json({ error: "Workflow cannot be started" }, { status: 400 })
    }

    // If workflow requires approval and is not approved, it cannot be started
    if (workflow.requires_approval && workflow.status !== "waiting_approval") {
      return NextResponse.json({ error: "Workflow requires approval" }, { status: 400 })
    }

    // Update workflow status to active
    const supabase = createServerClient()
    const { error } = await supabase
      .from("fm_crew_workflows")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      console.error("Error updating workflow status:", error)
      return NextResponse.json({ error: "Failed to start workflow" }, { status: 500 })
    }

    // Start the first task(s) (those without dependencies)
    const tasksToStart = workflow.tasks.filter((task) => task.dependencies.length === 0)

    for (const task of tasksToStart) {
      await updateTaskStatus(task.id, "in_progress")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error starting workflow:", error)
    return NextResponse.json({ error: "Failed to start workflow" }, { status: 500 })
  }
}
