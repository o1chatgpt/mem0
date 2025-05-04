import { createClient } from "@supabase/supabase-js"
import { parseYaml } from "@/utils/yaml-parser"
import { searchMemoriesBySimilarity } from "@/services/vector-store"
import { supabase as globalSupabase } from "@/lib/supabase"

// Use the global Supabase client from lib/supabase.ts if available, or create a new one
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = globalSupabase || createClient(supabaseUrl, supabaseKey)

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

// Helper function for retrying fetch operations
async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 2, delay = 1000): Promise<T> {
  let lastError: any
  let retryCount = 0

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed:`, error)
      lastError = error
      retryCount++

      if (attempt < maxRetries - 1) {
        // Wait before retrying with exponential backoff
        const waitTime = delay * Math.pow(2, attempt)
        console.log(`Waiting ${waitTime}ms before retry ${retryCount}/${maxRetries}`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  console.error(`All ${maxRetries} retry attempts failed`)
  throw lastError
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
    const tableExists = await checkTableExists("ai_tasks")
    if (!tableExists) {
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
    const tableExists = await checkTableExists("ai_tasks")
    if (!tableExists) {
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

// Helper function to check if a table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select("*", { head: true, count: "exact" }).limit(1)

    if (
      error &&
      (error.message.includes(`relation "${tableName}" does not exist`) ||
        error.message.includes(`relation "public.${tableName}" does not exist`))
    ) {
      return false
    }

    return true
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// Get all tasks
export async function getAllTasks(): Promise<Task[]> {
  try {
    // Check if the table exists first
    const tableExists = await checkTableExists("ai_tasks")
    if (!tableExists) {
      console.log("ai_tasks table does not exist yet, returning empty array")
      return []
    }

    // Use the retry operation helper for network resilience
    return await retryOperation(
      async () => {
        try {
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
        } catch (fetchError) {
          // If it's a network error or other fetch error, log it and throw to trigger retry
          console.error("Error fetching tasks:", fetchError)
          throw fetchError
        }
      },
      2, // Reduce max retries from 3 to 2
      1000,
    ) // Retry up to 2 times with increasing delay
  } catch (error) {
    // If it's a "relation does not exist" error, return empty array
    if (error instanceof Error && error.message.includes('relation "public.ai_tasks" does not exist')) {
      console.log("ai_tasks table does not exist yet (in catch), returning empty array")
      return []
    }

    console.error("Error fetching tasks after retries:", error)
    // Return empty array instead of re-throwing to prevent initialization errors
    return []
  }
}

// Get tasks by agent ID
export async function getTasksByAgent(agentId: string): Promise<Task[]> {
  try {
    // Check if the table exists
    const tableExists = await checkTableExists("ai_tasks")
    if (!tableExists) {
      console.log("ai_tasks table does not exist yet, returning empty array")
      return []
    }

    // Use retry operation for network resilience
    return await retryOperation(async () => {
      const { data, error } = await supabase
        .from("ai_tasks")
        .select("*")
        .eq("assigned_to", agentId)
        .order("created_at", { ascending: false })

      if (error) {
        // If it's a "relation does not exist" error, return empty array
        if (error.message.includes('relation "public.ai_tasks" does not exist')) {
          return []
        }
        throw error
      }

      return data || []
    })
  } catch (error) {
    console.error("Error fetching tasks by agent:", error)
    return []
  }
}

// Get task by ID
export async function getTaskById(id: string): Promise<Task | null> {
  try {
    // Check if the table exists
    const tableExists = await checkTableExists("ai_tasks")
    if (!tableExists) {
      console.error("ai_tasks table does not exist")
      return null
    }

    return await retryOperation(async () => {
      const { data, error } = await supabase.from("ai_tasks").select("*").eq("id", id).single()

      if (error) throw error
      return data
    })
  } catch (error) {
    console.error("Error fetching task by ID:", error)
    return null
  }
}

// Delete a task
export async function deleteTask(id: string): Promise<boolean> {
  try {
    // Check if the table exists
    const tableExists = await checkTableExists("ai_tasks")
    if (!tableExists) {
      console.error("ai_tasks table does not exist")
      return false
    }

    return await retryOperation(async () => {
      const { error } = await supabase.from("ai_tasks").delete().eq("id", id)

      if (error) throw error
      return true
    })
  } catch (error) {
    console.error("Error deleting task:", error)
    return false
  }
}

// Create a new crew
export async function createCrew(crew: Crew): Promise<Crew | null> {
  try {
    // Check if the table exists
    const tableExists = await checkTableExists("ai_crews")
    if (!tableExists) {
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
    const tableExists = await checkTableExists("ai_crews")
    if (!tableExists) {
      console.error("ai_crews table does not exist")
      return []
    }

    return await retryOperation(async () => {
      const { data, error } = await supabase.from("ai_crews").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    })
  } catch (error) {
    console.error("Error fetching crews:", error)
    return []
  }
}

// Get crew by ID
export async function getCrewById(id: string): Promise<Crew | null> {
  try {
    // Check if the table exists
    const tableExists = await checkTableExists("ai_crews")
    if (!tableExists) {
      console.error("ai_crews table does not exist")
      return null
    }

    return await retryOperation(async () => {
      const { data, error } = await supabase.from("ai_crews").select("*").eq("id", id).single()

      if (error) throw error
      return data
    })
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

// Check if tables exist
export async function checkTablesExist(): Promise<boolean> {
  try {
    // Try to query the ai_tasks table
    const tableExists = await checkTableExists("ai_tasks")
    return tableExists
  } catch (error) {
    console.error("Error checking if tables exist:", error)
    return false
  }
}
