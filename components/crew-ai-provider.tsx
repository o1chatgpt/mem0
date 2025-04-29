"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  getAllAgents,
  getAgentById,
  getAllTasks,
  getTasksByAgent,
  createTask,
  updateTask,
  deleteTask,
  findBestAgentForTask,
  handoffTask,
  executeTask,
  type Agent,
  type Task,
  checkTablesExist as serviceCheckTablesExist,
} from "@/services/crew-ai"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface CrewAIContextType {
  agents: Agent[]
  tasks: Task[]
  loading: boolean
  error: string | null
  selectedAgent: Agent | null
  selectedTask: Task | null
  tablesExist: boolean
  checkTablesExist: () => Promise<boolean>
  isCheckingTables: boolean
  networkError: boolean
  retryFetch: () => Promise<void>

  // Agent functions
  fetchAgents: () => Promise<void>
  selectAgent: (agentId: string) => Promise<void>

  // Task functions
  fetchTasks: () => Promise<void>
  fetchTasksByAgent: (agentId: string) => Promise<void>
  selectTask: (taskId: string) => Promise<void>
  createNewTask: (task: Task) => Promise<Task | null>
  updateExistingTask: (id: string, updates: Partial<Task>) => Promise<Task | null>
  removeTask: (id: string) => Promise<boolean>

  // CrewAI specific functions
  findBestAgent: (task: Task) => Promise<Agent | null>
  handoffTaskToAgent: (taskId: string, fromAgentId: string, toAgentId: string, reason: string) => Promise<Task | null>
  executeTaskWithAgent: (taskId: string, agentId: string) => Promise<{ success: boolean; result: string }>
}

const CrewAIContext = createContext<CrewAIContextType | undefined>(undefined)

export function CrewAIProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tablesExist, setTablesExist] = useState<boolean>(true)
  const [isCheckingTables, setIsCheckingTables] = useState<boolean>(true)
  const [networkError, setNetworkError] = useState<boolean>(false)
  const supabase = createClientComponentClient()

  // Check if tables exist
  const checkTablesExist = async (): Promise<boolean> => {
    setIsCheckingTables(true)
    try {
      const exists = await serviceCheckTablesExist()
      setTablesExist(exists)
      return exists
    } catch (error) {
      console.error("Error checking if tables exist:", error)
      setTablesExist(false)
      return false
    } finally {
      setIsCheckingTables(false)
    }
  }

  // Retry fetch function for network errors
  const retryFetch = async () => {
    setNetworkError(false)
    setError(null)
    await fetchAgents()
    await fetchTasks()
  }

  // Fetch all agents
  const fetchAgents = async () => {
    setLoading(true)
    setError(null)
    try {
      const agentsData = await getAllAgents()
      setAgents(agentsData)
      setNetworkError(false)
    } catch (err) {
      if (err instanceof Error && err.message === "Failed to fetch") {
        setNetworkError(true)
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Failed to fetch agents")
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      // Check if tables exist first without throwing an error
      const exists = await checkTablesExist()
      if (!exists) {
        console.log("Tables don't exist, setting empty tasks array")
        setTablesExist(false)
        setTasks([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const tasksData = await getAllTasks()
        // If we get here, we successfully fetched tasks (even if it's an empty array)
        setTasks(tasksData)
        setNetworkError(false)
      } catch (err: any) {
        // Handle network errors or other fetch failures
        if (err.message === "Failed to fetch") {
          console.error("Network error when fetching tasks:", err)
          setNetworkError(true)
          setError("Network error. Please check your connection and try again.")
        } else if (err.message && err.message.includes("relation") && err.message.includes("does not exist")) {
          // Handle database table not existing
          console.log("Table doesn't exist error in fetchTasks")
          setTablesExist(false)
          setTasks([])
        } else {
          // Handle other errors
          setError("Failed to fetch tasks")
          console.error(err)
        }
      } finally {
        setLoading(false)
      }
    } catch (error) {
      console.error("Error in fetchTasks:", error)
      setTablesExist(false)
      setTasks([])
      setLoading(false)
    }
  }

  // Fetch tasks by agent
  const fetchTasksByAgent = async (agentId: string) => {
    // Check if tables exist first
    const exists = await checkTablesExist()
    if (!exists) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const tasksData = await getTasksByAgent(agentId)
      setTasks(tasksData)
      setNetworkError(false)
    } catch (err: any) {
      // Handle network errors
      if (err.message === "Failed to fetch") {
        console.error("Network error when fetching tasks by agent:", err)
        setNetworkError(true)
        setError("Network error. Please check your connection and try again.")
      } else if (err.message && err.message.includes("relation") && err.message.includes("does not exist")) {
        // Handle database table not existing
        setTablesExist(false)
        console.warn("CrewAI tables do not exist yet. Please set up the database.")
      } else {
        // Handle other errors
        setError("Failed to fetch tasks for agent")
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  // Select an agent
  const selectAgent = async (agentId: string) => {
    setLoading(true)
    setError(null)
    try {
      const agent = await getAgentById(agentId)
      setSelectedAgent(agent)
      setNetworkError(false)
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setNetworkError(true)
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Failed to select agent")
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Select a task
  const selectTask = async (taskId: string) => {
    // Check if tables exist first
    const exists = await checkTablesExist()
    if (!exists) {
      return
    }

    const task = tasks.find((t) => t.id === taskId) || null
    setSelectedTask(task)
  }

  // Create a new task
  const createNewTask = async (task: Task) => {
    // Check if tables exist first
    const exists = await checkTablesExist()
    if (!exists) {
      setError("Database tables not set up. Please set up CrewAI first.")
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const newTask = await createTask(task)
      if (newTask) {
        setTasks((prev) => [newTask, ...prev])
      }
      setNetworkError(false)
      return newTask
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setNetworkError(true)
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Failed to create task")
      }
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update an existing task
  const updateExistingTask = async (id: string, updates: Partial<Task>) => {
    // Check if tables exist first
    const exists = await checkTablesExist()
    if (!exists) {
      setError("Database tables not set up. Please set up CrewAI first.")
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const updatedTask = await updateTask(id, updates)
      if (updatedTask) {
        setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
        if (selectedTask?.id === id) {
          setSelectedTask(updatedTask)
        }
      }
      setNetworkError(false)
      return updatedTask
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setNetworkError(true)
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Failed to update task")
      }
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Remove a task
  const removeTask = async (id: string) => {
    // Check if tables exist first
    const exists = await checkTablesExist()
    if (!exists) {
      setError("Database tables not set up. Please set up CrewAI first.")
      return false
    }

    setLoading(true)
    setError(null)
    try {
      const success = await deleteTask(id)
      if (success) {
        setTasks((prev) => prev.filter((task) => task.id !== id))
        if (selectedTask?.id === id) {
          setSelectedTask(null)
        }
      }
      setNetworkError(false)
      return success
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setNetworkError(true)
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Failed to delete task")
      }
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Find the best agent for a task
  const findBestAgent = async (task: Task) => {
    setLoading(true)
    setError(null)
    try {
      const agent = await findBestAgentForTask(task)
      setNetworkError(false)
      return agent
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setNetworkError(true)
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Failed to find best agent")
      }
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Handoff a task to another agent
  const handoffTaskToAgent = async (taskId: string, fromAgentId: string, toAgentId: string, reason: string) => {
    // Check if tables exist first
    const exists = await checkTablesExist()
    if (!exists) {
      setError("Database tables not set up. Please set up CrewAI first.")
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const updatedTask = await handoffTask(taskId, fromAgentId, toAgentId, reason)
      if (updatedTask) {
        setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)))
        if (selectedTask?.id === taskId) {
          setSelectedTask(updatedTask)
        }
      }
      setNetworkError(false)
      return updatedTask
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setNetworkError(true)
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Failed to handoff task")
      }
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Execute a task with an agent
  const executeTaskWithAgent = async (taskId: string, agentId: string) => {
    // Check if tables exist first
    const exists = await checkTablesExist()
    if (!exists) {
      setError("Database tables not set up. Please set up CrewAI first.")
      return { success: false, result: "Database tables not set up. Please set up CrewAI first." }
    }

    setLoading(true)
    setError(null)
    try {
      const result = await executeTask(taskId, agentId)
      // Refresh tasks to get the updated task with results
      await fetchTasks()
      setNetworkError(false)
      return result
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setNetworkError(true)
        setError("Network error. Please check your connection and try again.")
      } else {
        setError("Failed to execute task")
      }
      console.error(err)
      return { success: false, result: "Failed to execute task" }
    } finally {
      setLoading(false)
    }
  }

  // Initialize by checking if tables exist and fetching agents
  useEffect(() => {
    const init = async () => {
      try {
        // First check if tables exist
        const tablesExist = await checkTablesExist()
        setTablesExist(tablesExist)
        setIsCheckingTables(false)

        // Always fetch agents since they don't depend on the ai_tasks table
        await fetchAgents()

        // Only fetch tasks if tables exist
        if (tablesExist) {
          try {
            await fetchTasks()
          } catch (error) {
            console.log("Skipping task fetch during initialization due to error:", error)
            // Silently ignore task fetch errors during initialization
            setTasks([])
          }
        } else {
          // Make sure tasks is empty if tables don't exist
          setTasks([])
        }
      } catch (error) {
        console.error("Error during initialization:", error)
        setIsCheckingTables(false)
        setTablesExist(false)
        setTasks([])
      }
    }

    init()
  }, [])

  return (
    <CrewAIContext.Provider
      value={{
        agents,
        tasks,
        loading,
        error,
        selectedAgent,
        selectedTask,
        tablesExist,
        checkTablesExist,
        isCheckingTables,
        networkError,
        retryFetch,
        fetchAgents,
        selectAgent,
        fetchTasks,
        fetchTasksByAgent,
        selectTask,
        createNewTask,
        updateExistingTask,
        removeTask,
        findBestAgent,
        handoffTaskToAgent,
        executeTaskWithAgent,
      }}
    >
      {children}
    </CrewAIContext.Provider>
  )
}

export function useCrewAI() {
  const context = useContext(CrewAIContext)
  if (context === undefined) {
    throw new Error("useCrewAI must be used within a CrewAIProvider")
  }
  return context
}
