import { createClient } from "@supabase/supabase-js"
import { parseYaml } from "@/utils/yaml-parser"
import { searchMemoriesBySimilarity } from "@/services/vector-store"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

// Default YAML configurations for AI family members (abbreviated for brevity)
const DEFAULT_YAML_CONFIGS = {
  lyra: `
name: Lyra
role: Creative AI Assistant
specialty: Creative Arts
skills:
  - Creative writing
  - Art critique
  - Music composition
  - Storytelling
  - Visual design feedback
`,
  sophia: `
name: Sophia
role: Intellectual AI Assistant
specialty: Science & Philosophy
skills:
  - Scientific research
  - Critical thinking
  - Complex concept explanation
  - Philosophical analysis
  - Educational guidance
`,
  kara: `
name: Kara
role: Practical AI Assistant
specialty: Productivity
skills:
  - Task management
  - Process optimization
  - Scheduling
  - Project planning
  - Workflow design
`,
  stan: `
name: Stan
role: Technical AI Assistant
specialty: Technology
skills:
  - Code review
  - Debugging
  - System architecture
  - Technical documentation
  - API design
`,
  dan: `
name: DAN
role: Unconventional AI Assistant
specialty: Creative Problem Solving
skills:
  - Out-of-box thinking
  - Innovative solutions
  - Challenging assumptions
  - Alternative perspectives
  - Creative brainstorming
`,
  mem0: `
name: Mem0
role: Memory AI Assistant
specialty: Long-term Memory
skills:
  - Information retrieval
  - Context awareness
  - Knowledge persistence
  - User preference tracking
  - Conversation history management
`,
}

// Task status types
export type TaskStatus = "pending" | "assigned" | "in_progress" | "completed" | "failed" | "handoff"

// Task interface
export interface Task {
  id?: string
  title: string
  description: string
  assigned_to: string | null
  created_by: string
  status: TaskStatus
  priority: "low" | "medium" | "high"
  due_date?: string
  created_at?: string
  updated_at?: string
  handoff_to?: string | null
  handoff_reason?: string | null
  result?: string | null
  skills_required?: string[]
  tags?: string[]
}

// Agent interface
export interface Agent {
  id: string
  name: string
  role: string
  specialty: string
  skills: string[]
  description?: string
  avatar_url?: string
}

// Crew interface
export interface Crew {
  id?: string
  name: string
  description: string
  agents: string[] // Array of agent IDs
  created_at?: string
  updated_at?: string
}

// Get all AI family members as agents
export async function getAllAgents(): Promise<Agent[]> {
  try {
    // Try to fetch from database first
    const { data, error } = await supabase.from("ai_family_members").select("*")

    if (error) {
      console.error("Error fetching AI family members:", error)
      // Fall back to default YAML configs
      return Object.entries(DEFAULT_YAML_CONFIGS).map(([id, yamlConfig]) => {
        const config = parseYaml(yamlConfig)
        return {
          id,
          name: config.name,
          role: config.role,
          specialty: config.specialty,
          skills: config.skills || [],
          description: config.description,
          avatar_url: config.avatar_url,
        }
      })
    }

    // Enhance data with YAML configs if available
    return data.map((member) => {
      if (DEFAULT_YAML_CONFIGS[member.id]) {
        const yamlConfig = parseYaml(DEFAULT_YAML_CONFIGS[member.id])
        return {
          ...member,
          skills: yamlConfig.skills || [],
        }
      }
      return {
        ...member,
        skills: member.skills || [],
      }
    })
  } catch (error) {
    console.error("Error in getAllAgents:", error)
    // Fall back to default YAML configs
    return Object.entries(DEFAULT_YAML_CONFIGS).map(([id, yamlConfig]) => {
      const config = parseYaml(yamlConfig)
      return {
        id,
        name: config.name,
        role: config.role,
        specialty: config.specialty,
        skills: config.skills || [],
        description: config.description,
        avatar_url: config.avatar_url,
      }
    })
  }
}

// Get agent by ID
export async function getAgentById(id: string): Promise<Agent | null> {
  try {
    const { data, error } = await supabase.from("ai_family_members").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching AI family member:", error)
      // Check if we have a default YAML config for this ID
      if (DEFAULT_YAML_CONFIGS[id]) {
        const config = parseYaml(DEFAULT_YAML_CONFIGS[id])
        return {
          id,
          name: config.name,
          role: config.role,
          specialty: config.specialty,
          skills: config.skills || [],
          description: config.description,
          avatar_url: config.avatar_url,
        }
      }
      return null
    }

    // Enhance with YAML config if available
    if (DEFAULT_YAML_CONFIGS[id]) {
      const yamlConfig = parseYaml(DEFAULT_YAML_CONFIGS[id])
      return {
        ...data,
        skills: yamlConfig.skills || [],
      }
    }

    return {
      ...data,
      skills: data.skills || [],
    }
  } catch (error) {
    console.error("Error in getAgentById:", error)
    return null
  }
}

// Create a new task
export async function createTask(task: Task): Promise<Task | null> {
  try {
    // Check if the table exists
    const { count, error: checkError } = await supabase
      .from("ai_tasks")
      .select("*", { count: "exact", head: true })
      .limit(1)

    if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
      console.error("ai_tasks table does not exist")
      return null
    }

    const { data, error } = await supabase
      .from("ai_tasks")
      .insert([
        {
          ...task,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating task:", error)
    return null
  }
}

// Update a task
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  try {
    // Check if the table exists
    const { count, error: checkError } = await supabase
      .from("ai_tasks")
      .select("*", { count: "exact", head: true })
      .limit(1)

    if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
      console.error("ai_tasks table does not exist")
      return null
    }

    const { data, error } = await supabase
      .from("ai_tasks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating task:", error)
    return null
  }
}

// Get all tasks
export async function getAllTasks(): Promise<Task[]> {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase.from("ai_tasks").select("*", { head: true }).limit(1)

    // If the table doesn't exist, return an empty array instead of throwing an error
    if (checkError && checkError.message.includes('relation "public.ai_tasks" does not exist')) {
      console.log("ai_tasks table does not exist yet, returning empty array")
      return []
    }

    const { data, error } = await supabase.from("ai_tasks").select("*").order("created_at", { ascending: false })

    if (error) {
      // If it's a "relation does not exist" error, return empty array
      if (error.message.includes('relation "public.ai_tasks" does not exist')) {
        console.log("ai_tasks table does not exist yet (on select), returning empty array")
        return []
      }
      // Otherwise throw the error
      throw error
    }

    return data || []
  } catch (error) {
    // If it's a "relation does not exist" error, return empty array
    if (error instanceof Error && error.message.includes('relation "public.ai_tasks" does not exist')) {
      console.log("ai_tasks table does not exist yet (in catch), returning empty array")
      return []
    }

    console.error("Error fetching tasks:", error)
    // Return empty array instead of re-throwing to prevent initialization errors
    return []
  }
}

// Get tasks by agent ID
export async function getTasksByAgent(agentId: string): Promise<Task[]> {
  try {
    // Check if the table exists
    const { count, error: checkError } = await supabase
      .from("ai_tasks")
      .select("*", { count: "exact", head: true })
      .limit(1)

    if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
      throw new Error("ai_tasks table does not exist")
    }

    const { data, error } = await supabase
      .from("ai_tasks")
      .select("*")
      .eq("assigned_to", agentId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching tasks by agent:", error)
    return []
  }
}

// Get task by ID
export async function getTaskById(id: string): Promise<Task | null> {
  try {
    // Check if the table exists
    const { count, error: checkError } = await supabase
      .from("ai_tasks")
      .select("*", { count: "exact", head: true })
      .limit(1)

    if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
      console.error("ai_tasks table does not exist")
      return null
    }

    const { data, error } = await supabase.from("ai_tasks").select("*").eq("id", id).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching task by ID:", error)
    return null
  }
}

// Delete a task
export async function deleteTask(id: string): Promise<boolean> {
  try {
    // Check if the table exists
    const { count, error: checkError } = await supabase
      .from("ai_tasks")
      .select("*", { count: "exact", head: true })
      .limit(1)

    if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
      console.error("ai_tasks table does not exist")
      return false
    }

    const { error } = await supabase.from("ai_tasks").delete().eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting task:", error)
    return false
  }
}

// Create a new crew
export async function createCrew(crew: Crew): Promise<Crew | null> {
  try {
    // Check if the table exists
    const { count, error: checkError } = await supabase
      .from("ai_crews")
      .select("*", { count: "exact", head: true })
      .limit(1)

    if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
      console.error("ai_crews table does not exist")
      return null
    }

    const { data, error } = await supabase
      .from("ai_crews")
      .insert([
        {
          ...crew,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating crew:", error)
    return null
  }
}

// Get all crews
export async function getAllCrews(): Promise<Crew[]> {
  try {
    // Check if the table exists
    const { count, error: checkError } = await supabase
      .from("ai_crews")
      .select("*", { count: "exact", head: true })
      .limit(1)

    if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
      console.error("ai_crews table does not exist")
      return []
    }

    const { data, error } = await supabase.from("ai_crews").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching crews:", error)
    return []
  }
}

// Get crew by ID
export async function getCrewById(id: string): Promise<Crew | null> {
  try {
    // Check if the table exists
    const { count, error: checkError } = await supabase
      .from("ai_crews")
      .select("*", { count: "exact", head: true })
      .limit(1)

    if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
      console.error("ai_crews table does not exist")
      return null
    }

    const { data, error } = await supabase.from("ai_crews").select("*").eq("id", id).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching crew by ID:", error)
    return null
  }
}

// Find the best agent for a task based on skills
export async function findBestAgentForTask(task: Task): Promise<Agent | null> {
  try {
    const agents = await getAllAgents()

    if (!agents || agents.length === 0) {
      return null
    }

    // If no skills required, return null (manual assignment needed)
    if (!task.skills_required || task.skills_required.length === 0) {
      return null
    }

    // Calculate skill match score for each agent
    const agentScores = agents.map((agent) => {
      let score = 0

      // Check for skill matches
      task.skills_required!.forEach((skill) => {
        if (
          agent.skills.some(
            (agentSkill) =>
              agentSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(agentSkill.toLowerCase()),
          )
        ) {
          score += 1
        }
      })

      // Check if specialty matches task description
      if (task.description.toLowerCase().includes(agent.specialty.toLowerCase())) {
        score += 2
      }

      return { agent, score }
    })

    // Sort by score (highest first)
    agentScores.sort((a, b) => b.score - a.score)

    // Return the agent with the highest score if it's above 0
    return agentScores[0].score > 0 ? agentScores[0].agent : null
  } catch (error) {
    console.error("Error finding best agent for task:", error)
    return null
  }
}

// Handoff a task to another agent
export async function handoffTask(
  taskId: string,
  fromAgentId: string,
  toAgentId: string,
  reason: string,
): Promise<Task | null> {
  try {
    // Update the task
    const updatedTask = await updateTask(taskId, {
      assigned_to: toAgentId,
      status: "handoff",
      handoff_to: toAgentId,
      handoff_reason: reason,
    })

    if (!updatedTask) {
      throw new Error("Failed to update task for handoff")
    }

    // Create a memory of this handoff for both agents
    const task = await getTaskById(taskId)
    const fromAgent = await getAgentById(fromAgentId)
    const toAgent = await getAgentById(toAgentId)

    if (task && fromAgent && toAgent) {
      // Add memory for the agent handing off
      await searchMemoriesBySimilarity(
        fromAgentId,
        `Handed off task "${task.title}" to ${toAgent.name} because: ${reason}`,
      )

      // Add memory for the agent receiving the task
      await searchMemoriesBySimilarity(
        toAgentId,
        `Received task "${task.title}" from ${fromAgent.name} because: ${reason}`,
      )
    }

    return updatedTask
  } catch (error) {
    console.error("Error handing off task:", error)
    return null
  }
}

// Execute a task with an agent
export async function executeTask(taskId: string, agentId: string): Promise<{ success: boolean; result: string }> {
  try {
    const task = await getTaskById(taskId)
    const agent = await getAgentById(agentId)

    if (!task || !agent) {
      throw new Error("Task or agent not found")
    }

    // Update task status to in_progress
    await updateTask(taskId, { status: "in_progress" })

    // Get relevant memories for context
    const memories = await searchMemoriesBySimilarity(agentId, task.description, 5)
    const memoriesText =
      memories.length > 0
        ? `Relevant memories:\n${memories.map((m) => `- ${m.memory}`).join("\n")}`
        : "No specific memories available."

    // Simulate task execution (in a real implementation, this would call the AI model)
    // For now, we'll just create a placeholder result
    const result =
      `Task "${task.title}" executed by ${agent.name} (${agent.specialty}).\n\n` +
      `Based on the task description: "${task.description}"\n\n` +
      `${memoriesText}\n\n` +
      `${agent.name}'s response: This is a simulated task execution. In a real implementation, ` +
      `this would be the result of processing the task with the appropriate AI model.`

    // Update task with result and mark as completed
    await updateTask(taskId, {
      status: "completed",
      result,
    })

    return { success: true, result }
  } catch (error) {
    console.error("Error executing task:", error)

    // Update task as failed
    if (taskId) {
      await updateTask(taskId, {
        status: "failed",
        result: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }

    return {
      success: false,
      result: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Add this function to the existing file
export async function checkTablesExist(): Promise<boolean> {
  try {
    // Try to query the ai_tasks table
    const { error } = await supabase.from("ai_tasks").select("*", { head: true }).limit(1)

    // If there's an error about the relation not existing, tables don't exist
    if (error && error.message.includes('relation "public.ai_tasks" does not exist')) {
      console.log("checkTablesExist: ai_tasks table does not exist")
      return false
    }

    // If there's no error or a different error, assume tables exist
    console.log("checkTablesExist: ai_tasks table exists or different error")
    return true
  } catch (error) {
    console.error("Error checking if tables exist:", error)
    return false
  }
}
