import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import type { AIFamilyMember } from "@/types/ai-family"
import type { Task } from "@/types/task"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Get the current user ID
export const getCurrentUserId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id
}

// AI Family Members CRUD operations
export const getAIFamilyMembers = async () => {
  const { data, error } = await supabase.from("ai_family_members").select("*").order("name")

  if (error) {
    console.error("Error fetching AI Family members:", error)
    return []
  }

  return data
}

export const getAIFamilyMember = async (id: string) => {
  const { data, error } = await supabase.from("ai_family_members").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching AI Family member with ID ${id}:`, error)
    return null
  }

  return data
}

export const createAIFamilyMember = async (member: Omit<AIFamilyMember, "id">) => {
  const newMember = {
    ...member,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("ai_family_members").insert([newMember]).select()

  if (error) {
    console.error("Error creating AI Family member:", error)
    return null
  }

  return data[0]
}

export const updateAIFamilyMember = async (id: string, updates: Partial<AIFamilyMember>) => {
  const { data, error } = await supabase
    .from("ai_family_members")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error(`Error updating AI Family member with ID ${id}:`, error)
    return null
  }

  return data[0]
}

export const deleteAIFamilyMember = async (id: string) => {
  const { error } = await supabase.from("ai_family_members").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting AI Family member with ID ${id}:`, error)
    return false
  }

  return true
}

// Upload AI Family member image
export const uploadAIFamilyMemberImage = async (file: File, memberId: string) => {
  const fileExt = file.name.split(".").pop()
  const fileName = `${memberId}.${fileExt}`
  const filePath = `ai-family/${fileName}`

  const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file, {
    upsert: true,
  })

  if (uploadError) {
    console.error("Error uploading image:", uploadError)
    return null
  }

  const { data } = supabase.storage.from("images").getPublicUrl(filePath)

  return data.publicUrl
}

// Tasks CRUD operations
export const getTasks = async () => {
  const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data
}

export const getTask = async (id: string) => {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching task with ID ${id}:`, error)
    return null
  }

  return data
}

export const createTask = async (task: Omit<Task, "id">) => {
  const newTask = {
    ...task,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("tasks").insert([newTask]).select()

  if (error) {
    console.error("Error creating task:", error)
    return null
  }

  return data[0]
}

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error(`Error updating task with ID ${id}:`, error)
    return null
  }

  return data[0]
}

export const deleteTask = async (id: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting task with ID ${id}:`, error)
    return false
  }

  return true
}

// Chat sessions CRUD operations
export const getChatSessions = async () => {
  const userId = await getCurrentUserId()

  if (!userId) return []

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching chat sessions:", error)
    return []
  }

  return data
}

export const createChatSession = async (aiMemberId: string, title = "New Chat") => {
  const userId = await getCurrentUserId()

  if (!userId) return null

  const newSession = {
    id: uuidv4(),
    user_id: userId,
    ai_member_id: aiMemberId,
    title,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("chat_sessions").insert([newSession]).select()

  if (error) {
    console.error("Error creating chat session:", error)
    return null
  }

  return data[0]
}

export const updateChatSession = async (id: string, updates: { title?: string; is_bookmarked?: boolean }) => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error(`Error updating chat session with ID ${id}:`, error)
    return null
  }

  return data[0]
}

export const deleteChatSession = async (id: string) => {
  // First delete all messages in the session
  const { error: messagesError } = await supabase.from("chat_messages").delete().eq("session_id", id)

  if (messagesError) {
    console.error(`Error deleting messages for session ${id}:`, messagesError)
    return false
  }

  // Then delete the session
  const { error } = await supabase.from("chat_sessions").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting chat session with ID ${id}:`, error)
    return false
  }

  return true
}

// Chat messages CRUD operations
export const getChatMessages = async (sessionId: string) => {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at")

  if (error) {
    console.error(`Error fetching messages for session ${sessionId}:`, error)
    return []
  }

  return data
}

export const createChatMessage = async (sessionId: string, content: string, isUser: boolean) => {
  const newMessage = {
    id: uuidv4(),
    session_id: sessionId,
    content,
    is_user: isUser,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("chat_messages").insert([newMessage]).select()

  if (error) {
    console.error("Error creating chat message:", error)
    return null
  }

  return data[0]
}

// File storage operations
export const uploadFile = async (file: File, folder: string) => {
  const userId = await getCurrentUserId()

  if (!userId) return null

  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${folder}/${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage.from("files").upload(filePath, file, {
    upsert: false,
  })

  if (uploadError) {
    console.error("Error uploading file:", uploadError)
    return null
  }

  const { data } = supabase.storage.from("files").getPublicUrl(filePath)

  return {
    url: data.publicUrl,
    path: filePath,
    name: file.name,
    size: file.size,
    type: file.type,
  }
}

export const getUserFiles = async (folder: string) => {
  const userId = await getCurrentUserId()

  if (!userId) return []

  const { data, error } = await supabase.storage.from("files").list(`${folder}/${userId}`)

  if (error) {
    console.error(`Error listing files in ${folder}:`, error)
    return []
  }

  return data.map((file) => ({
    name: file.name,
    path: `${folder}/${userId}/${file.name}`,
    url: supabase.storage.from("files").getPublicUrl(`${folder}/${userId}/${file.name}`).data.publicUrl,
    size: file.metadata?.size,
    created_at: file.created_at,
  }))
}

export const deleteFile = async (path: string) => {
  const { error } = await supabase.storage.from("files").remove([path])

  if (error) {
    console.error(`Error deleting file at ${path}:`, error)
    return false
  }

  return true
}
