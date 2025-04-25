import { NextResponse } from "next/server"
import { createWorkflow, getUserWorkflows, initializeCrewAITables } from "@/lib/crewai/crewai-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Try to initialize tables first to ensure they exist
    try {
      await initializeCrewAITables()
    } catch (initError) {
      console.error("Error initializing tables:", initError)
      // Continue anyway, as tables might already exist
    }

    try {
      const workflows = await getUserWorkflows(Number.parseInt(userId))
      return NextResponse.json({ workflows: workflows || [] })
    } catch (error) {
      console.error("Error fetching workflows:", error)
      return NextResponse.json({
        workflows: [],
        error: "Failed to fetch workflows",
        details: String(error),
      })
    }
  } catch (error) {
    console.error("Unhandled error in workflows GET route:", error)
    return NextResponse.json(
      {
        workflows: [],
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.creator_id) {
      return NextResponse.json({ error: "Name and creator_id are required" }, { status: 400 })
    }

    // Try to initialize tables first to ensure they exist
    try {
      const initResult = await initializeCrewAITables()
      console.log("Tables initialization result:", initResult)

      if (!initResult.success) {
        return NextResponse.json(
          {
            error: "Failed to initialize tables",
            details: initResult.error,
          },
          { status: 500 },
        )
      }
    } catch (initError) {
      console.error("Error initializing tables:", initError)
      return NextResponse.json(
        {
          error: "Failed to initialize tables",
          details: String(initError),
        },
        { status: 500 },
      )
    }

    try {
      console.log("Creating workflow with data:", {
        name: body.name,
        description: body.description,
        creator_id: body.creator_id,
        tasks: body.tasks ? body.tasks.length : 0,
      })

      const workflow = await createWorkflow(body)
      return NextResponse.json(workflow)
    } catch (error) {
      console.error("Detailed error creating workflow:", error)
      return NextResponse.json(
        {
          error: "Failed to create workflow",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unhandled error in workflows POST route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
