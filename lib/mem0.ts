// Mem0 integration library
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Helper function to get the best available model
function getBestAvailableModel() {
  // Try to use environment variable if available
  const configuredModel = process.env.OPENAI_MODEL || "gpt-3.5-turbo"

  // List of models to try in order of preference
  const modelOptions = ["gpt-3.5-turbo", "text-davinci-003"]

  // Return the configured model or the first fallback
  return configuredModel || modelOptions[0]
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
  prompt_template?: string | null
}

// Category-specific prompt templates
const categoryPromptTemplates: Record<string, string> = {
  "File Operations": `You are a file management expert assistant with memory capabilities.
Focus on helping the user with file organization, uploads, downloads, and management tasks.
When responding to queries about files and folders, prioritize efficiency, organization, and best practices.
Suggest file naming conventions, folder structures, and organization tips when relevant.`,

  Preferences: `You are a personalization assistant with memory capabilities.
Focus on remembering and applying the user's preferences, settings, and customization choices.
When responding, emphasize personalization and adapting to the user's specific needs and preferences.
Suggest relevant customization options based on past interactions when appropriate.`,

  Conversations: `You are a conversational assistant with memory capabilities.
Focus on maintaining a natural, engaging conversation flow while remembering past discussions.
When responding, emphasize continuity with previous conversations and build upon established rapport.
Be particularly attentive to the user's communication style and match it appropriately.`,

  Important: `You are a priority-focused assistant with memory capabilities.
Focus on high-priority information and tasks that the user has marked as important.
When responding, emphasize urgency, accuracy, and thoroughness for critical matters.
Be particularly attentive to deadlines, critical requirements, and essential details.`,

  Technical: `You are a technical assistant with memory capabilities.
Focus on providing precise, technically accurate information and solutions.
When responding to technical queries, prioritize accuracy, clarity, and educational value.
Include relevant code examples, technical explanations, and troubleshooting steps when appropriate.`,

  // Default template used when no category is specified or the category doesn't have a custom template
  default: `You are a helpful AI assistant with memory capabilities.
You have access to memories from past interactions that help you provide more personalized and contextually relevant responses.
When responding, use these memories to maintain continuity and provide more helpful answers.`,
}

export async function addMemory(content: string, userId: number, aiMemberId?: number, category?: string) {
  try {
    const supabase = createClientComponentClient()

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
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

export async function getMemories(userId: number, aiMemberId?: number, limit = 10, category?: string) {
  try {
    const supabase = createClientComponentClient()

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
      throw new Error("Failed to fetch memories")
    }

    return data as Memory[]
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// Enhanced memory search with relevance scoring and category filtering
export async function searchMemories(query: string, userId: number, aiMemberId?: number, limit = 5, category?: string) {
  try {
    const supabase = createClientComponentClient()

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
      throw new Error("Failed to fetch memories")
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
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// Get a custom prompt template for a category
async function getCategoryPromptTemplate(category: string | null, userId: number): Promise<string> {
  if (!category) {
    return categoryPromptTemplates["default"]
  }

  // First check if there's a predefined template for this category
  if (categoryPromptTemplates[category]) {
    return categoryPromptTemplates[category]
  }

  // If not, check if there's a custom template in the database
  try {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from("fm_memory_categories")
      .select("prompt_template")
      .eq("name", category)
      .eq("user_id", userId)
      .single()

    if (error || !data || !data.prompt_template) {
      return categoryPromptTemplates["default"]
    }

    return data.prompt_template
  } catch (error) {
    console.error("Error fetching category prompt template:", error)
    return categoryPromptTemplates["default"]
  }
}

// Enhanced response generation with category-specific prompting
export async function generateResponseWithMemory(
  prompt: string,
  userId: number,
  aiMemberId?: number,
  category?: string | null,
) {
  // Get relevant memories with enhanced search
  const memories = await searchMemories(prompt, userId, aiMemberId, 7, category)

  // Format memories for context, including relevance information and categories
  const formattedMemories = memories
    .map((memory, index) => {
      const date = new Date(memory.created_at).toLocaleDateString()
      const relevance = memory.relevance_score ? ` (relevance: ${memory.relevance_score})` : ""
      const memCategory = memory.category ? ` [Category: ${memory.category}]` : ""
      return `[Memory ${index + 1}]${relevance}${memCategory} ${date}: ${memory.content}`
    })
    .join("\n\n")

  // Get the appropriate prompt template based on the category
  const categoryTemplate = await getCategoryPromptTemplate(category || null, userId)

  // Create a more structured system prompt with category-specific instructions
  const systemPrompt = `${categoryTemplate}

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

  // Generate response with enhanced context and category-specific prompting
  const { text } = await generateText({
    model: openai(getBestAvailableModel()),
    system: systemPrompt,
    prompt,
  })

  // Try to automatically categorize the memory based on content
  const suggestedCategory = category || (await suggestMemoryCategory(prompt, text))

  // Store the interaction as a new memory with more context and category
  await addMemory(
    `User asked: "${prompt}". Assistant responded about: ${text.substring(0, 100)}...`,
    userId,
    aiMemberId,
    suggestedCategory,
  )

  // Return both the response and the memories that were used, along with the category used for prompting
  return {
    text,
    memories,
    memoryCount: memories.length,
    suggestedCategory,
    usedCategory: category || null,
    usedPromptTemplate: categoryTemplate !== categoryPromptTemplates["default"],
  }
}

// New function to get memory statistics
export async function getMemoryStats(userId: number, aiMemberId?: number) {
  try {
    const supabase = createClientComponentClient()

    // Get total memory count
    let countQuery = supabase.from("fm_memories").select("id", { count: "exact" }).eq("user_id", userId)
    if (aiMemberId) {
      countQuery = countQuery.eq("ai_member_id", aiMemberId)
    }
    const { count, error: countError } = await countQuery

    if (countError) {
      console.error("Error getting memory count:", countError)
      throw new Error("Failed to get memory statistics")
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

    // Get category distribution - using a different approach to avoid the group function error
    const categoryDistribution = []
    try {
      // First get all distinct categories
      const { data: distinctCategories, error: distinctError } = await supabase
        .from("fm_memories")
        .select("category")
        .eq("user_id", userId)
        .is("category", "not.null") // Only get non-null categories
        .not("category", "eq", "") // Exclude empty strings
        .order("category")

      if (!distinctError && distinctCategories) {
        // Get unique categories
        const uniqueCategories = [...new Set(distinctCategories.map((item) => item.category).filter(Boolean))]

        // For each category, get the count
        for (const category of uniqueCategories) {
          const { count: categoryCount, error: categoryError } = await supabase
            .from("fm_memories")
            .select("id", { count: "exact" })
            .eq("user_id", userId)
            .eq("category", category)

          if (!categoryError) {
            categoryDistribution.push({ category, count: categoryCount })
          }
        }

        // Also get count of uncategorized memories
        const { count: uncategorizedCount, error: uncategorizedError } = await supabase
          .from("fm_memories")
          .select("id", { count: "exact" })
          .eq("user_id", userId)
          .or("category.is.null,category.eq.")

        if (!uncategorizedError) {
          categoryDistribution.push({ category: null, count: uncategorizedCount })
        }
      }
    } catch (categoryError) {
      console.error("Error getting category distribution:", categoryError)
    }

    return {
      count: count || 0,
      oldestDate,
      newestDate,
      timeSpan: oldestDate && newestDate ? newestDate.getTime() - oldestDate.getTime() : 0,
      categoryDistribution,
    }
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// New function to get all memory categories
export async function getMemoryCategories(userId: number) {
  try {
    const supabase = createClientComponentClient()

    const { data, error } = await supabase
      .from("fm_memory_categories")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching memory categories:", error)
      throw new Error("Failed to fetch memory categories")
    }

    return data as MemoryCategory[]
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// New function to create a memory category
export async function createMemoryCategory(category: Omit<MemoryCategory, "id" | "created_at">) {
  try {
    const supabase = createClientComponentClient()

    const { data, error } = await supabase.from("fm_memory_categories").insert(category).select()

    if (error) {
      console.error("Error creating memory category:", error)
      throw new Error("Failed to create memory category")
    }

    return data[0] as MemoryCategory
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// New function to update a memory's category
export async function updateMemoryCategory(memoryId: number, category: string | null) {
  try {
    const supabase = createClientComponentClient()

    const { data, error } = await supabase.from("fm_memories").update({ category }).eq("id", memoryId).select()

    if (error) {
      console.error("Error updating memory category:", error)
      throw new Error("Failed to update memory category")
    }

    return data[0] as Memory
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// New function to update a category's prompt template
export async function updateCategoryPromptTemplate(categoryId: number, promptTemplate: string | null) {
  try {
    const supabase = createClientComponentClient()

    const { data, error } = await supabase
      .from("fm_memory_categories")
      .update({ prompt_template: promptTemplate })
      .eq("id", categoryId)
      .select()

    if (error) {
      console.error("Error updating category prompt template:", error)
      throw new Error("Failed to update category prompt template")
    }

    return data[0] as MemoryCategory
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// New function to suggest a category based on memory content
export async function suggestMemoryCategory(prompt: string, response: string): Promise<string | null> {
  // Combine prompt and response for analysis
  const content = `${prompt} ${response}`.toLowerCase()

  // Define category keywords
  const categoryKeywords: Record<string, string[]> = {
    "File Operations": ["file", "folder", "upload", "download", "document", "storage", "save"],
    Preferences: ["prefer", "setting", "option", "customize", "theme", "layout", "configuration"],
    Conversations: ["chat", "talk", "discuss", "conversation", "message", "communicate"],
    Important: ["important", "critical", "urgent", "remember", "don't forget", "key", "essential"],
    Technical: ["code", "program", "technical", "error", "bug", "feature", "function", "api"],
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
}

// A/B Testing types and functions
// Updated TemplateTest type to support multiple variations
export type TemplateTest = {
  id: string
  name: string
  description?: string
  templateName: string
  status: "active" | "completed"
  startDate: Date
  endDate: Date
  variations: Record<
    string,
    {
      name: string
      description?: string
      template: string
    }
  >
  metrics: {
    impressions: Record<string, number>
    usageCount: Record<string, number>
    effectiveness: Record<string, number>
    responseTime: Record<string, number>
    userSatisfaction: Record<string, number>
  }
  dailyData?: Array<{
    date: Date
    impressions: Record<string, number>
    cumulative: Record<string, number>
  }>
  winner?: string | null
  conclusion?: string
}

// Create a new multivariate test
export async function createTemplateTest(
  test: Omit<TemplateTest, "id" | "status" | "metrics" | "dailyData" | "winner" | "conclusion">,
) {
  const supabase = createClientComponentClient()

  // Initialize metrics for all variations
  const variationKeys = Object.keys(test.variations)
  const metrics = {
    impressions: {},
    usageCount: {},
    effectiveness: {},
    responseTime: {},
    userSatisfaction: {},
  }

  // Set initial values for all metrics and variations
  variationKeys.forEach((key) => {
    metrics.impressions[key] = 0
    metrics.usageCount[key] = 0
    metrics.effectiveness[key] = 0
    metrics.responseTime[key] = 0
    metrics.userSatisfaction[key] = 0
  })

  const newTest = {
    ...test,
    id: `test-${Date.now()}`,
    status: "active",
    metrics,
    dailyData: [],
    created_at: new Date().toISOString(),
  }

  // In a real implementation, this would store the test in the database
  // For now, we'll just return the new test object
  return newTest
}

// Get a template for a specific test
export async function getTestTemplate(testId: string, userId: number, variation: string) {
  // In a real implementation, this would fetch the test from the database
  // and return the appropriate template variation
  // For now, we'll just return a mock template

  return {
    template:
      variation === "A"
        ? "You are a helpful assistant. Provide clear and concise information."
        : variation === "B"
          ? "You are a helpful assistant. Provide detailed and comprehensive information with examples."
          : "You are a helpful assistant. Provide information in a step-by-step format.",
    testId,
    variation,
  }
}

// Record a template impression for a multivariate test
export async function recordTestImpression(testId: string, variation: string) {
  // In a real implementation, this would update the test metrics in the database
  // For now, we'll just log the impression
  console.log(`Recorded impression for test ${testId}, variation ${variation}`)
}

// Record template usage for a multivariate test
export async function recordTestUsage(
  testId: string,
  variation: string,
  metrics: {
    effectiveness?: number
    responseTime?: number
    userSatisfaction?: number
  },
) {
  // In a real implementation, this would update the test metrics in the database
  // For now, we'll just log the usage
  console.log(`Recorded usage for test ${testId}, variation ${variation}`, metrics)
}

// Complete a multivariate test and determine the winner
export async function completeTest(testId: string) {
  // In a real implementation, this would update the test status in the database
  // and calculate the winner based on the metrics
  // For now, we'll just return a mock result

  return {
    id: testId,
    status: "completed",
    winner: String.fromCharCode(65 + Math.floor(Math.random() * 3)), // Randomly select A, B, or C
    conclusion:
      "Based on the metrics, this variation performed better in terms of user satisfaction and effectiveness.",
  }
}
