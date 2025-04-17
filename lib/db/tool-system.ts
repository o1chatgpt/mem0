import { createClient } from "@/lib/supabase-client"
import type { Tool, AIFamilyTool, AppRoute } from "@/types/tool-system"

// Get all tools
export async function getAllTools(): Promise<Tool[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("tools").select("*").order("name")

  if (error) {
    console.error("Error fetching tools:", error)
    return []
  }

  return data || []
}

// Get a tool by ID
export async function getToolById(id: number): Promise<Tool | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("tools").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching tool with ID ${id}:`, error)
    return null
  }

  return data
}

// Get a tool by slug
export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("tools").select("*").eq("slug", slug).single()

  if (error) {
    console.error(`Error fetching tool with slug ${slug}:`, error)
    return null
  }

  return data
}

// Create a new tool
export async function createTool(tool: Omit<Tool, "id" | "created_at" | "updated_at">): Promise<Tool | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("tools").insert([tool]).select().single()

  if (error) {
    console.error("Error creating tool:", error)
    return null
  }

  return data
}

// Update a tool
export async function updateTool(
  id: number,
  tool: Partial<Omit<Tool, "id" | "created_at" | "updated_at">>,
): Promise<Tool | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tools")
    .update({ ...tool, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating tool with ID ${id}:`, error)
    return null
  }

  return data
}

// Delete a tool
export async function deleteTool(id: number): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("tools").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting tool with ID ${id}:`, error)
    return false
  }

  return true
}

// Get tools for an AI family member
export async function getToolsForAIFamilyMember(aiFamilyId: string): Promise<Tool[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("ai_family_tools")
    .select(`
      tool_id,
      permission_level,
      tools (*)
    `)
    .eq("ai_family_id", aiFamilyId)

  if (error) {
    console.error(`Error fetching tools for AI family member ${aiFamilyId}:`, error)
    return []
  }

  return (
    data?.map((item) => ({
      ...item.tools,
      permission_level: item.permission_level,
    })) || []
  )
}

// Assign a tool to an AI family member
export async function assignToolToAIFamilyMember(
  aiFamilyId: string,
  toolId: number,
  permissionLevel: "use" | "manage" | "admin" = "use",
): Promise<AIFamilyTool | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("ai_family_tools")
    .insert([
      {
        ai_family_id: aiFamilyId,
        tool_id: toolId,
        permission_level: permissionLevel,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error(`Error assigning tool ${toolId} to AI family member ${aiFamilyId}:`, error)
    return null
  }

  return data
}

// Create a new app route
export async function createAppRoute(
  route: Omit<AppRoute, "id" | "created_at" | "updated_at">,
): Promise<AppRoute | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("app_routes").insert([route]).select().single()

  if (error) {
    console.error("Error creating app route:", error)
    return null
  }

  return data
}

// Get all app routes
export async function getAllAppRoutes(): Promise<AppRoute[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("app_routes").select("*").eq("is_active", true).order("route")

  if (error) {
    console.error("Error fetching app routes:", error)
    return []
  }

  return data || []
}
