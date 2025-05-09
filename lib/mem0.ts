// Mem0 integration library
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createServerClient } from "@/lib/db"

// Helper function to get the best available model
function getBestAvailableModel() {
  // Try to use environment variable if available
  const configuredModel = process.env.OPENAI_MODEL || "gpt-3.5-turbo"

  // List of models to try in order of preference
  const modelOptions = ["gpt-3.5-turbo", "text-davinci-003"]

  // Return the configured model or the first fallback
  return configuredModel || modelOptions[0]
}

// Helper function to validate OpenAI API key
async function isValidOpenAIKey(apiKey: string | undefined): Promise<boolean> {
  if (!apiKey) return false

  try {
    // Make a minimal API call to validate the key
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return response.status === 200
  } catch (error) {
    console.error("Error validating OpenAI API key:", error)
    return false
  }
}

// Helper function to get a valid API key
async function getValidAPIKey(): Promise<string | null> {
  // Try environment variable first
  const envKey = process.env.OPENAI_API_KEY
  if (await isValidOpenAIKey(envKey)) {
    return envKey
  }

  // If environment variable is invalid, try to get a key from the database
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from("api_keys")
      .select("key, service")
      .eq("service", "openai")
      .eq("is_active", true)
      .limit(1)

    if (data && data.length > 0) {
      const dbKey = data[0].key
      if (await isValidOpenAIKey(dbKey)) {
        return dbKey
      }
    }
  } catch (error) {
    console.error("Error fetching API key from database:", error)
  }

  return null
}

export type Memory = {
  id: number
  content: string
  created_at: string
  ai_member_id: number | null
  category?: string | null
  relevance_score?: number
}

export type MemoryCategory = {
  id: number
  name: string
  description: string | null
  color: string | null
  icon: string | null
  user_id: number
  created_at: string
}

// Default categories to use if none exist
export const DEFAULT_MEMORY_CATEGORIES = [
  {
    name: "File Operations",
    description: "Memories related to file uploads, downloads, and management",
    color: "#4CAF50",
    icon: "file",
  },
  {
    name: "Preferences",
    description: "User preferences and settings",
    color: "#2196F3",
    icon: "settings",
  },
  {
    name: "Important",
    description: "Critical information that needs to be remembered",
    color: "#F44336",
    icon: "alert-circle",
  },
  {
    name: "Conversations",
    description: "Records of important conversations",
    color: "#9C27B0",
    icon: "message-circle",
  },
  {
    name: "Technical",
    description: "Technical details and specifications",
    color: "#FF9800",
    icon: "code",
  },
  {
    name: "Personal",
    description: "Personal preferences and information",
    color: "#795548",
    icon: "user",
  },
  {
    name: "Work",
    description: "Work-related information and tasks",
    color: "#607D8B",
    icon: "briefcase",
  },
  {
    name: "Reference",
    description: "Reference materials and documentation",
    color: "#009688",
    icon: "book",
  },
]

// Initialize database tables
export async function initializeMemoryTables() {
  const supabase = createServerClient()

  try {
    // Check if fm_memories table exists
    const { count: memoriesCount, error: memoriesError } = await supabase
      .from("fm_memories")
      .select("*", { count: "exact", head: true })

    // Create fm_memories table if it doesn't exist
    if (memoriesError) {
      console.log("Creating fm_memories table...")
      await supabase.rpc("create_table", {
        table_name: "fm_memories",
        table_definition: `
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          user_id INTEGER NOT NULL,
          ai_member_id INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          category TEXT
        `,
      })
    }

    // Check if fm_memory_categories table exists
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from("fm_memory_categories")
      .select("*", { count: "exact", head: true })

    // Create fm_memory_categories table if it doesn't exist
    if (categoriesError) {
      console.log("Creating fm_memory_categories table...")
      await supabase.rpc("create_table", {
        table_name: "fm_memory_categories",
        table_definition: `
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT,
          icon TEXT,
          user_id INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(name, user_id)
        `,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing memory tables:", error)
    return { success: false, error }
  }
}

// New function to ensure default categories exist
export async function ensureDefaultCategories(userId: number): Promise<boolean> {
  const supabase = createServerClient()

  try {
    // First check if any categories exist for this user
    const { data: existingCategories, error: checkError } = await supabase
      .from("fm_memory_categories")
      .select("id")
      .eq("user_id", userId)
      .limit(1)

    if (checkError) {
      console.error("Error checking for existing categories:", checkError)
      return false
    }

    // If categories already exist, no need to create defaults
    if (existingCategories && existingCategories.length > 0) {
      console.log(`User ${userId} already has memory categories. Skipping default creation.`)
      return true
    }

    console.log(`No memory categories found for user ${userId}. Creating defaults...`)

    // Create default categories for this user
    const categoriesToInsert = DEFAULT_MEMORY_CATEGORIES.map((category) => ({
      ...category,
      user_id: userId,
    }))

    // Insert categories in batches to avoid potential issues
    const BATCH_SIZE = 3
    for (let i = 0; i < categoriesToInsert.length; i += BATCH_SIZE) {
      const batch = categoriesToInsert.slice(i, i + BATCH_SIZE)
      const { error: insertError } = await supabase.from("fm_memory_categories").insert(batch)

      if (insertError) {
        console.error(`Error inserting batch of default categories:`, insertError)
        // Continue with next batch even if this one failed
      }
    }

    console.log(`Default categories created for user ${userId}`)
    return true
  } catch (error) {
    console.error("Error ensuring default categories:", error)
    return false
  }
}

export async function addMemory(content: string, userId: number, aiMemberId?: number, category?: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from("fm_memories")
      .insert({
        content,
        user_id: userId,
        ai_member_id: aiMemberId || null,
        category,
      })
      .select()

    if (error) {
      console.error("Error adding memory:", error)
      throw new Error("Failed to add memory")
    }

    return data[0]
  } catch (error) {
    console.error("Error in addMemory:", error)
    // Return a default object instead of throwing
    return {
      id: 0,
      content,
      user_id: userId,
      ai_member_id: aiMemberId || null,
      category,
      created_at: new Date().toISOString(),
    }
  }
}

export async function getMemories(userId: number, aiMemberId?: number, limit = 10, category?: string) {
  const supabase = createServerClient()

  try {
    let query = supabase
      .from("fm_memories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (aiMemberId) {
      query = query.eq("ai_member_id", aiMemberId)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching memories:", error)
      return []
    }

    return data as Memory[]
  } catch (error) {
    console.error("Error in getMemories:", error)
    return []
  }
}

// Enhanced memory search with relevance scoring and category filtering
export async function searchMemories(query: string, userId: number, aiMemberId?: number, limit = 5, category?: string) {
  const supabase = createServerClient()

  try {
    // First, get all memories for this user (and optionally AI member)
    let dbQuery = supabase.from("fm_memories").select("*").eq("user_id", userId)

    if (aiMemberId) {
      dbQuery = dbQuery.eq("ai_member_id", aiMemberId)
    }

    if (category) {
      dbQuery = dbQuery.eq("category", category)
    }

    const { data: allMemories, error } = await dbQuery

    if (error) {
      console.error("Error fetching memories:", error)
      return []
    }

    if (!allMemories || allMemories.length === 0) {
      return []
    }

    // Calculate relevance scores for each memory
    const scoredMemories = allMemories.map((memory) => {
      // Base score starts at 0
      let score = 0

      // 1. Content relevance - check if query terms appear in the memory
      const queryTerms = query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 2)
      const memoryContent = memory.content.toLowerCase()

      // Score based on term matches
      for (const term of queryTerms) {
        if (memoryContent.includes(term)) {
          // More points for exact matches
          score += 5

          // Additional points for matches at the beginning of the content
          if (memoryContent.startsWith(term)) {
            score += 3
          }
        }
      }

      // 2. Recency factor - newer memories get higher scores
      const memoryAge = Date.now() - new Date(memory.created_at).getTime()
      const recencyScore = Math.max(10 - Math.floor(memoryAge / (1000 * 60 * 60 * 24)), 0) // 0-10 points based on days old
      score += recencyScore

      // 3. Length factor - prefer more detailed memories but not too long
      const contentLength = memory.content.length
      if (contentLength > 20 && contentLength < 500) {
        score += 2
      } else if (contentLength >= 500) {
        score += 1
      }

      // 4. Context matching - check for contextual relevance
      // This is a simplified version - in a real implementation, you might use embeddings
      const contextTerms = [
        { terms: ["file", "folder", "document", "upload", "download"], context: "file operations" },
        { terms: ["image", "photo", "picture", "video"], context: "media" },
        { terms: ["share", "collaborate", "send"], context: "sharing" },
        { terms: ["delete", "remove", "trash"], context: "deletion" },
        { terms: ["rename", "move", "copy"], context: "file management" },
      ]

      for (const context of contextTerms) {
        // Check if query is about this context
        const isQueryAboutContext = context.terms.some((term) => query.toLowerCase().includes(term))

        // Check if memory is about this context
        const isMemoryAboutContext = context.terms.some((term) => memoryContent.includes(term))

        // If both query and memory are about the same context, boost score
        if (isQueryAboutContext && isMemoryAboutContext) {
          score += 4
        }
      }

      // 5. Category bonus - if memory has a category, give it a small boost
      if (memory.category) {
        score += 1
      }

      return {
        ...memory,
        relevance_score: score,
      }
    })

    // Sort by relevance score (highest first) and take the top results
    const sortedMemories = scoredMemories
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, limit)

    return sortedMemories as Memory[]
  } catch (error) {
    console.error("Error in searchMemories:", error)
    return []
  }
}

// Enhanced response generation with better context utilization and category awareness
export async function generateResponseWithMemory(
  prompt: string,
  userId: number,
  aiMemberId?: number,
  category?: string,
) {
  try {
    // Get relevant memories with enhanced search
    const memories = await searchMemories(prompt, userId, aiMemberId, 7, category)

    // Format memories for context, including relevance information and categories
    const formattedMemories = memories
      .map((memory, index) => {
        const date = new Date(memory.created_at).toLocaleDateString()
        const relevance = memory.relevance_score ? ` (relevance: ${memory.relevance_score})` : ""
        const category = memory.category ? ` [Category: ${memory.category}]` : ""
        return `[Memory ${index + 1}]${relevance}${category} ${date}: ${memory.content}`
      })
      .join("\n\n")

    // Create a more structured system prompt
    const systemPrompt = `You are a helpful AI assistant with memory capabilities. 
You have access to the following relevant memories from past interactions:

${formattedMemories || "No specific memories found for this query."}

Guidelines for using memories:
1. Prioritize memories with higher relevance scores when they're available
2. Reference specific memories when they directly answer the user's question
3. Use memories to personalize your response and maintain continuity
4. If memories contradict each other, prefer more recent ones
5. If the memories don't contain relevant information, respond based on your general knowledge
6. Don't explicitly mention "Memory 1", "Memory 2", etc. in your response - integrate the information naturally

Current user query: "${prompt}"
`

    // Validate API key before attempting to generate text
    const validApiKey = await getValidAPIKey()

    if (!validApiKey) {
      // If no valid API key is available, return a fallback response
      console.warn("No valid OpenAI API key available. Using fallback response.")

      // Store the interaction as a new memory
      try {
        await addMemory(
          `User asked: "${prompt}". No AI response due to API key issue.`,
          userId,
          aiMemberId,
          "Technical",
        )
      } catch (error) {
        console.error("Error storing interaction memory:", error)
      }

      return {
        text: "I'm sorry, but I'm currently unable to access my AI capabilities due to an API key configuration issue. Your message has been saved, and a system administrator has been notified. In the meantime, you can still use the file management features of the application.",
        memories,
        memoryCount: memories.length,
        suggestedCategory: "Technical",
        error: "API_KEY_INVALID",
      }
    }

    // Generate response with enhanced context
    try {
      const { text } = await generateText({
        model: openai(getBestAvailableModel()),
        system: systemPrompt,
        prompt,
        apiKey: validApiKey,
      })

      // Try to automatically categorize the memory based on content
      const suggestedCategory = await suggestMemoryCategory(prompt, text)

      // Store the interaction as a new memory with more context and category
      try {
        await addMemory(
          `User asked: "${prompt}". Assistant responded about: ${text.substring(0, 100)}...`,
          userId,
          aiMemberId,
          suggestedCategory,
        )
      } catch (error) {
        console.error("Error storing interaction memory:", error)
      }

      // Return both the response and the memories that were used
      return {
        text,
        memories,
        memoryCount: memories.length,
        suggestedCategory,
      }
    } catch (error) {
      console.error("Error generating text with OpenAI:", error)

      // Store the interaction as a new memory
      try {
        await addMemory(
          `User asked: "${prompt}". Error generating AI response: ${error.message}`,
          userId,
          aiMemberId,
          "Technical",
        )
      } catch (memoryError) {
        console.error("Error storing interaction memory:", memoryError)
      }

      return {
        text: "I apologize, but I encountered an error while generating a response. This could be due to a temporary issue with the AI service. Your message has been saved, and you can try again later.",
        memories,
        memoryCount: memories.length,
        suggestedCategory: "Technical",
        error: error.message,
      }
    }
  } catch (error) {
    console.error("Error in generateResponseWithMemory:", error)
    return {
      text: "I'm sorry, I'm having trouble accessing my memory capabilities right now. How can I help you without referencing past interactions?",
      memories: [],
      memoryCount: 0,
      suggestedCategory: null,
      error: error.message,
    }
  }
}

// New function to get memory statistics
export async function getMemoryStats(userId: number, aiMemberId?: number) {
  try {
    const supabase = createServerClient()

    // Get total memory count
    let countQuery = supabase.from("fm_memories").select("id", { count: "exact" }).eq("user_id", userId)
    if (aiMemberId) {
      countQuery = countQuery.eq("ai_member_id", aiMemberId)
    }
    const { count, error: countError } = await countQuery

    if (countError) {
      console.error("Error getting memory count:", countError)
      return {
        count: 0,
        categoryDistribution: [],
        monthlyDistribution: {},
        uncategorizedCount: 0,
      }
    }

    // Get oldest and newest memory dates
    let timeQuery = supabase.from("fm_memories").select("created_at").eq("user_id", userId)

    if (aiMemberId) {
      timeQuery = timeQuery.eq("ai_member_id", aiMemberId)
    }

    const oldestQuery = await timeQuery.order("created_at", { ascending: true }).limit(1)
    const newestQuery = await timeQuery.order("created_at", { ascending: false }).limit(1)

    const oldestDate = oldestQuery.data && oldestQuery.data.length > 0 ? new Date(oldestQuery.data[0].created_at) : null
    const newestDate = newestQuery.data && newestQuery.data.length > 0 ? new Date(newestQuery.data[0].created_at) : null

    // Get all memories for this user
    let memoryQuery = supabase.from("fm_memories").select("category").eq("user_id", userId)
    if (aiMemberId) {
      memoryQuery = memoryQuery.eq("ai_member_id", aiMemberId)
    }
    const { data: allMemories, error: categoryError } = await memoryQuery

    if (categoryError) {
      console.error("Error getting category distribution:", categoryError)
      return {
        count: count || 0,
        categoryDistribution: [],
        monthlyDistribution: {},
        uncategorizedCount: 0,
      }
    }

    // Count categories manually
    const categoryCounts: Record<string, number> = {}
    allMemories?.forEach((memory) => {
      const category = memory.category || "Uncategorized"
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    // Format the data to match the expected structure
    const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }))

    // Get category details to include colors and descriptions
    const { data: categories, error: categoriesError } = await supabase
      .from("fm_memory_categories")
      .select("*")
      .eq("user_id", userId)

    if (categoriesError) {
      console.error("Error getting category details:", categoriesError)
    }

    // Format category distribution with additional details
    const categoryDistribution = (categoryData || []).map((item: any) => {
      const category = categories?.find((c) => c.name === item.category) || null
      return {
        name: item.category || "Uncategorized",
        count: Number.parseInt(item.count, 10),
        color: category?.color || "#888888",
        description: category?.description || null,
        icon: category?.icon || null,
      }
    })

    // Sort by count (descending)
    categoryDistribution.sort((a, b) => b.count - a.count)

    // Get time-based distribution (memories per month)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: timeDistribution, error: timeError } = await supabase
      .from("fm_memories")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", sixMonthsAgo.toISOString())

    if (timeError) {
      console.error("Error getting time distribution:", timeError)
    }

    // Group by month
    const monthlyDistribution: Record<string, number> = {}
    ;(timeDistribution || []).forEach((item: any) => {
      const date = new Date(item.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyDistribution[monthKey] = (monthlyDistribution[monthKey] || 0) + 1
    })

    // Calculate percentage distribution
    const totalCount = count || 0
    const percentageDistribution = categoryDistribution.map((item) => ({
      ...item,
      percentage: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
    }))

    return {
      count: count || 0,
      oldestDate,
      newestDate,
      timeSpan: oldestDate && newestDate ? newestDate.getTime() - oldestDate.getTime() : 0,
      categoryDistribution: percentageDistribution,
      monthlyDistribution,
      uncategorizedCount: percentageDistribution.find((item) => item.name === "Uncategorized")?.count || 0,
    }
  } catch (error) {
    console.error("Error in getMemoryStats:", error)
    return {
      count: 0,
      categoryDistribution: [],
      monthlyDistribution: {},
      uncategorizedCount: 0,
    }
  }
}

// New function to get all memory categories
export async function getMemoryCategories(userId: number) {
  try {
    const supabase = createServerClient()

    // Check if the table exists first
    try {
      const { count, error: countError } = await supabase
        .from("fm_memory_categories")
        .select("*", { count: "exact", head: true })

      // If there's an error, the table might not exist
      if (countError) {
        console.error("Error checking memory_categories table:", countError)
        // Initialize the tables
        await initializeMemoryTables()
      }
    } catch (error) {
      console.error("Error checking memory_categories table:", error)
      return [] // Return empty array instead of throwing error
    }

    // Now fetch the actual data
    const { data, error } = await supabase
      .from("fm_memory_categories")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching memory categories:", error)
      return [] // Return empty array instead of throwing error
    }

    // If no categories were found, create default ones and fetch again
    if (!data || data.length === 0) {
      console.log(`No categories found for user ${userId}. Creating defaults...`)
      await ensureDefaultCategories(userId)

      // Try fetching again after creating defaults
      const { data: newData, error: newError } = await supabase
        .from("fm_memory_categories")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true })

      if (newError) {
        console.error("Error fetching memory categories after creating defaults:", newError)
        return [] // Return empty array instead of throwing error
      }

      return newData as MemoryCategory[]
    }

    return data as MemoryCategory[]
  } catch (error) {
    console.error("Unexpected error in getMemoryCategories:", error)
    return [] // Return empty array on any error
  }
}

// New function to create a memory category
export async function createMemoryCategory(category: Omit<MemoryCategory, "id" | "created_at">) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("fm_memory_categories").insert(category).select()

    if (error) {
      console.error("Error creating memory category:", error)
      throw new Error("Failed to create memory category")
    }

    return data[0] as MemoryCategory
  } catch (error) {
    console.error("Error in createMemoryCategory:", error)
    // Return a default object instead of throwing
    return {
      id: 0,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      user_id: category.user_id,
      created_at: new Date().toISOString(),
    } as MemoryCategory
  }
}

// New function to update a memory's category
export async function updateMemoryCategory(memoryId: number, category: string | null) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("fm_memories").update({ category }).eq("id", memoryId).select()

    if (error) {
      console.error("Error updating memory category:", error)
      throw new Error("Failed to update memory category")
    }

    return data[0] as Memory
  } catch (error) {
    console.error("Error in updateMemoryCategory:", error)
    // Return a default object instead of throwing
    return {
      id: memoryId,
      content: "",
      category,
      created_at: new Date().toISOString(),
    } as Memory
  }
}

// New function to suggest a category based on memory content
export async function suggestMemoryCategory(prompt: string, response: string): Promise<string | null> {
  try {
    // Combine prompt and response for analysis
    const content = `${prompt} ${response}`.toLowerCase()

    // Define category keywords
    const categoryKeywords: Record<string, string[]> = {
      "File Operations": ["file", "folder", "upload", "download", "document", "storage", "save"],
      Preferences: ["prefer", "setting", "option", "customize", "theme", "layout", "configuration"],
      Conversations: ["chat", "talk", "discuss", "conversation", "message", "communicate"],
      Important: ["important", "critical", "urgent", "remember", "don't forget", "key", "essential"],
      Technical: ["code", "program", "technical", "error", "bug", "feature", "function", "api"],
      Personal: ["personal", "private", "individual", "own", "self", "me", "my"],
      Work: ["work", "job", "project", "task", "deadline", "meeting", "colleague"],
      Reference: ["reference", "documentation", "manual", "guide", "instruction", "how-to"],
    }

    // Check each category for keyword matches
    const matches: Record<string, number> = {}

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      matches[category] = 0
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          matches[category]++
        }
      }
    }

    // Find the category with the most matches
    let bestCategory: string | null = null
    let highestMatches = 0

    for (const [category, matchCount] of Object.entries(matches)) {
      if (matchCount > highestMatches) {
        highestMatches = matchCount
        bestCategory = category
      }
    }

    // Only suggest a category if we have a minimum number of matches
    return highestMatches >= 2 ? bestCategory : null
  } catch (error) {
    console.error("Error in suggestMemoryCategory:", error)
    return null
  }
}

// Function to predict future memory growth based on historical data
export async function predictMemoryGrowth(userId: number, aiMemberId?: number, monthsToPredict = 3) {
  try {
    const supabase = createServerClient()

    // Get historical memory creation data for the past 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    let query = supabase
      .from("fm_memories")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", twelveMonthsAgo.toISOString())
      .order("created_at", { ascending: true })

    if (aiMemberId) {
      query = query.eq("ai_member_id", aiMemberId)
    }

    const { data: memories, error } = await query

    if (error) {
      console.error("Error fetching historical memory data:", error)
      return {
        historical: [],
        predicted: [],
        trend: "insufficient_data",
        confidence: 0,
        averageGrowthRate: 0,
      }
    }

    // Group memories by month
    const monthlyData: Record<string, number> = {}

    memories?.forEach((memory) => {
      const date = new Date(memory.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
    })

    // Convert to array and sort by month
    const sortedMonthlyData = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // If we have less than 2 months of data, we can't make a reliable prediction
    if (sortedMonthlyData.length < 2) {
      return {
        historical: sortedMonthlyData,
        predicted: [],
        trend: "insufficient_data",
        confidence: 0,
        averageGrowthRate: 0,
      }
    }

    // Calculate month-over-month growth rates
    const growthRates: number[] = []
    for (let i = 1; i < sortedMonthlyData.length; i++) {
      const prevCount = sortedMonthlyData[i - 1].count
      const currentCount = sortedMonthlyData[i].count

      // Avoid division by zero
      if (prevCount > 0) {
        const growthRate = (currentCount - prevCount) / prevCount
        growthRates.push(growthRate)
      }
    }

    // Calculate average growth rate
    const averageGrowthRate =
      growthRates.length > 0 ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length : 0

    // Get the last month in our data
    const lastMonth = sortedMonthlyData[sortedMonthlyData.length - 1]
    const [lastYear, lastMonthNum] = lastMonth.month.split("-").map((n) => Number.parseInt(n))

    // Predict future months
    const predictions = []
    let predictedCount = lastMonth.count

    for (let i = 1; i <= monthsToPredict; i++) {
      const predictionDate = new Date(lastYear, lastMonthNum - 1)
      predictionDate.setMonth(predictionDate.getMonth() + i)

      const predictionMonth = `${predictionDate.getFullYear()}-${String(predictionDate.getMonth() + 1).padStart(2, "0")}`

      // Apply growth rate to predict next month
      predictedCount = Math.round(predictedCount * (1 + averageGrowthRate))

      // Ensure we don't predict negative values
      predictedCount = Math.max(0, predictedCount)

      predictions.push({
        month: predictionMonth,
        count: predictedCount,
        isPrediction: true,
      })
    }

    // Determine trend
    let trend: "increasing" | "decreasing" | "stable" | "insufficient_data" = "stable"
    if (averageGrowthRate > 0.05) {
      trend = "increasing"
    } else if (averageGrowthRate < -0.05) {
      trend = "decreasing"
    }

    // Calculate confidence based on consistency of growth rates
    // Lower standard deviation = higher confidence
    let confidence = 0.5 // Default medium confidence
    if (growthRates.length > 1) {
      const mean = averageGrowthRate
      const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / growthRates.length
      const stdDev = Math.sqrt(variance)

      // Convert standard deviation to a confidence score (0-1)
      // Lower stdDev means higher confidence
      confidence = Math.max(0, Math.min(1, 1 - stdDev / Math.abs(mean + 0.0001)))

      // If we have very few data points, reduce confidence
      if (sortedMonthlyData.length < 4) {
        confidence *= 0.7
      }
    }

    return {
      historical: sortedMonthlyData,
      predicted: predictions,
      trend,
      confidence,
      averageGrowthRate,
    }
  } catch (error) {
    console.error("Error in predictMemoryGrowth:", error)
    return {
      historical: [],
      predicted: [],
      trend: "insufficient_data",
      confidence: 0,
      averageGrowthRate: 0,
    }
  }
}
