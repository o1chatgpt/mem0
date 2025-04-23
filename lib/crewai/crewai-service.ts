import { createServerClient } from "@/lib/db"
import { triggerWebhook } from "@/lib/webhook-service"
import { addMemory } from "@/lib/mem0"

// CrewAI Task Status
export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "waiting_approval"

// CrewAI Task Type
export type TaskType =
  | "web_scraping"
  | "content_creation"
  | "image_generation"
  | "code_generation"
  | "data_analysis"
  | "research"
  | "validation"
  | "deployment"

// CrewAI Task
export interface CrewTask {
  id: string
  title: string
  description: string
  type: TaskType
  status: TaskStatus
  assignee_id: number | null
  creator_id: number
  workflow_id: string
  dependencies: string[] // IDs of tasks that must be completed before this one
  input_data: any
  output_data: any | null
  created_at: string
  updated_at: string
  due_date: string | null
  priority: "low" | "medium" | "high"
}

// CrewAI Workflow
export interface CrewWorkflow {
  id: string
  name: string
  description: string
  creator_id: number
  tasks: CrewTask[]
  status: "draft" | "active" | "completed" | "failed"
  created_at: string
  updated_at: string
  requires_approval: boolean
  admin_notes: string | null
}

// Enhance the initializeCrewAITables function with better error handling and logging
export async function initializeCrewAITables() {
  const supabase = createServerClient()

  try {
    console.log("Starting CrewAI tables initialization...")

    // Check if fm_crew_workflows table exists
    let workflowsExist = false
    try {
      const { count, error } = await supabase.from("fm_crew_workflows").select("*", { count: "exact", head: true })

      workflowsExist = !error
      console.log("Workflows table check:", workflowsExist ? "exists" : "does not exist")
    } catch (error) {
      console.log("Workflows table does not exist, will create it:", error)
    }

    // Create fm_crew_workflows table if it doesn't exist
    if (!workflowsExist) {
      console.log("Creating fm_crew_workflows table...")
      const { error } = await supabase.rpc("create_table", {
        table_name: "fm_crew_workflows",
        table_definition: `
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          creator_id INTEGER NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          requires_approval BOOLEAN DEFAULT TRUE,
          admin_notes TEXT
        `,
      })

      if (error) {
        console.error("Error creating workflows table:", error)
        throw new Error(`Failed to create workflows table: ${error.message}`)
      }
      console.log("Workflows table created successfully")
    }

    // Check if fm_crew_tasks table exists
    let tasksExist = false
    try {
      const { count, error } = await supabase.from("fm_crew_tasks").select("*", { count: "exact", head: true })

      tasksExist = !error
      console.log("Tasks table check:", tasksExist ? "exists" : "does not exist")
    } catch (error) {
      console.log("Tasks table does not exist, will create it:", error)
    }

    // Create fm_crew_tasks table if it doesn't exist
    if (!tasksExist) {
      console.log("Creating fm_crew_tasks table...")
      const { error } = await supabase.rpc("create_table", {
        table_name: "fm_crew_tasks",
        table_definition: `
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL,
          status TEXT NOT NULL,
          assignee_id INTEGER,
          creator_id INTEGER NOT NULL,
          workflow_id TEXT NOT NULL,
          dependencies TEXT[],
          input_data JSONB,
          output_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          due_date TIMESTAMP WITH TIME ZONE,
          priority TEXT DEFAULT 'medium'
        `,
      })

      if (error) {
        console.error("Error creating tasks table:", error)
        throw new Error(`Failed to create tasks table: ${error.message}`)
      }
      console.log("Tasks table created successfully")

      // Add foreign key constraint after both tables exist
      if (workflowsExist || !error) {
        console.log("Adding foreign key constraint...")
        const { error: fkError } = await supabase.rpc("execute_sql", {
          sql: `
            ALTER TABLE fm_crew_tasks 
            ADD CONSTRAINT fk_workflow 
            FOREIGN KEY (workflow_id) 
            REFERENCES fm_crew_workflows(id) 
            ON DELETE CASCADE;
          `,
        })

        if (fkError) {
          console.error("Error adding foreign key constraint:", fkError)
          // Don't throw here, as the tables are created and this is just a constraint
        } else {
          console.log("Foreign key constraint added successfully")
        }
      }
    }

    console.log("CrewAI tables initialization completed successfully")
    return { success: true }
  } catch (error) {
    console.error("Error in initializeCrewAITables:", error)
    return { success: false, error: String(error) }
  }
}

// Create a new workflow
export async function createWorkflow(
  workflow: Omit<CrewWorkflow, "id" | "created_at" | "updated_at">,
): Promise<CrewWorkflow> {
  const supabase = createServerClient()

  const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("fm_crew_workflows")
    .insert({
      id: workflowId,
      name: workflow.name,
      description: workflow.description,
      creator_id: workflow.creator_id,
      status: workflow.status,
      created_at: now,
      updated_at: now,
      requires_approval: workflow.requires_approval,
      admin_notes: workflow.admin_notes,
    })
    .select()

  if (error) {
    console.error("Error creating workflow:", error)
    throw new Error(`Failed to create workflow: ${error.message}`)
  }

  // Create tasks for this workflow
  const tasks = await Promise.all(
    workflow.tasks.map((task) =>
      createTask({
        ...task,
        workflow_id: workflowId,
      }),
    ),
  )

  return {
    ...data[0],
    tasks,
  }
}

// Create a new task
export async function createTask(task: Omit<CrewTask, "id" | "created_at" | "updated_at">): Promise<CrewTask> {
  const supabase = createServerClient()

  const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("fm_crew_tasks")
    .insert({
      id: taskId,
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      assignee_id: task.assignee_id,
      creator_id: task.creator_id,
      workflow_id: task.workflow_id,
      dependencies: task.dependencies,
      input_data: task.input_data,
      output_data: task.output_data,
      created_at: now,
      updated_at: now,
      due_date: task.due_date,
      priority: task.priority,
    })
    .select()

  if (error) {
    console.error("Error creating task:", error)
    throw new Error(`Failed to create task: ${error.message}`)
  }

  return data[0]
}

// Get workflow by ID
export async function getWorkflow(id: string): Promise<CrewWorkflow | null> {
  const supabase = createServerClient()

  const { data: workflow, error: workflowError } = await supabase
    .from("fm_crew_workflows")
    .select("*")
    .eq("id", id)
    .single()

  if (workflowError) {
    console.error("Error fetching workflow:", workflowError)
    return null
  }

  const { data: tasks, error: tasksError } = await supabase.from("fm_crew_tasks").select("*").eq("workflow_id", id)

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError)
    return null
  }

  return {
    ...workflow,
    tasks: tasks || [],
  }
}

// Get all workflows for a user
export async function getUserWorkflows(userId: number): Promise<CrewWorkflow[]> {
  const supabase = createServerClient()

  const { data: workflows, error: workflowsError } = await supabase
    .from("fm_crew_workflows")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })

  if (workflowsError) {
    console.error("Error fetching workflows:", workflowsError)
    return []
  }

  const workflowsWithTasks = await Promise.all(
    workflows.map(async (workflow) => {
      const { data: tasks, error: tasksError } = await supabase
        .from("fm_crew_tasks")
        .select("*")
        .eq("workflow_id", workflow.id)

      if (tasksError) {
        console.error("Error fetching tasks for workflow:", tasksError)
        return { ...workflow, tasks: [] }
      }

      return { ...workflow, tasks: tasks || [] }
    }),
  )

  return workflowsWithTasks
}

// Get tasks assigned to an AI family member
export async function getAssignedTasks(aiMemberId: number): Promise<CrewTask[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("fm_crew_tasks")
    .select("*")
    .eq("assignee_id", aiMemberId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching assigned tasks:", error)
    return []
  }

  return data || []
}

// Update task status
export async function updateTaskStatus(taskId: string, status: TaskStatus, outputData?: any): Promise<CrewTask | null> {
  const supabase = createServerClient()

  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (outputData !== undefined) {
    updates.output_data = outputData
  }

  const { data, error } = await supabase.from("fm_crew_tasks").update(updates).eq("id", taskId).select()

  if (error) {
    console.error("Error updating task status:", error)
    return null
  }

  // Check if all tasks in the workflow are completed
  const task = data[0]
  if (status === "completed") {
    const { data: workflowTasks, error: tasksError } = await supabase
      .from("fm_crew_tasks")
      .select("status")
      .eq("workflow_id", task.workflow_id)

    if (!tasksError && workflowTasks) {
      const allCompleted = workflowTasks.every((t) => t.status === "completed")

      if (allCompleted) {
        await supabase
          .from("fm_crew_workflows")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", task.workflow_id)

        // Trigger webhook for workflow completion
        await triggerWebhook("workflow.completed", {
          workflow_id: task.workflow_id,
          completed_at: new Date().toISOString(),
        })
      }
    }
  }

  // Store memory of task completion
  if (status === "completed" && task.assignee_id) {
    await addMemory(
      `Completed task "${task.title}" as part of workflow. Output: ${JSON.stringify(outputData).substring(0, 200)}...`,
      task.creator_id,
      task.assignee_id,
      "Tasks",
    )
  }

  return data[0]
}

// Submit workflow for admin approval
export async function submitWorkflowForApproval(workflowId: string, notes?: string): Promise<boolean> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("fm_crew_workflows")
    .update({
      status: "waiting_approval",
      admin_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workflowId)

  if (error) {
    console.error("Error submitting workflow for approval:", error)
    return false
  }

  // Trigger webhook for workflow approval request
  await triggerWebhook("workflow.approval_requested", {
    workflow_id: workflowId,
    requested_at: new Date().toISOString(),
    notes: notes || null,
  })

  return true
}

// Approve or reject workflow
export async function reviewWorkflow(workflowId: string, approved: boolean, notes?: string): Promise<boolean> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("fm_crew_workflows")
    .update({
      status: approved ? "active" : "rejected",
      admin_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workflowId)

  if (error) {
    console.error("Error reviewing workflow:", error)
    return false
  }

  // Trigger webhook for workflow review
  await triggerWebhook(approved ? "workflow.approved" : "workflow.rejected", {
    workflow_id: workflowId,
    reviewed_at: new Date().toISOString(),
    notes: notes || null,
  })

  return true
}

// Check if tasks are ready to be executed (all dependencies completed)
export async function getReadyTasks(): Promise<CrewTask[]> {
  const supabase = createServerClient()

  // Get all pending tasks
  const { data: pendingTasks, error } = await supabase.from("fm_crew_tasks").select("*").eq("status", "pending")

  if (error || !pendingTasks) {
    console.error("Error fetching pending tasks:", error)
    return []
  }

  // Filter tasks that have all dependencies completed
  const readyTasks = await Promise.all(
    pendingTasks.map(async (task) => {
      if (!task.dependencies || task.dependencies.length === 0) {
        return task // No dependencies, task is ready
      }

      const { data: dependencies, error: depError } = await supabase
        .from("fm_crew_tasks")
        .select("status")
        .in("id", task.dependencies)

      if (depError) {
        console.error("Error fetching task dependencies:", depError)
        return null
      }

      const allDependenciesCompleted = dependencies.every((dep) => dep.status === "completed")
      return allDependenciesCompleted ? task : null
    }),
  )

  return readyTasks.filter(Boolean) as CrewTask[]
}
