import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Helper function to get the best available model
function getBestAvailableModel() {
  // Try to use environment variable if available
  const configuredModel = process.env.OPENAI_MODEL || "gpt-3.5-turbo"
  return configuredModel
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Handle different actions
    switch (action) {
      case "add": {
        const { content, aiMemberId, category } = body
        if (!content) {
          return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }

        const { data, error } = await supabase
          .from("fm_memories")
          .insert({
            content,
            user_id: userId,
            ai_member_id: aiMemberId || null,
            category: category || null,
          })
          .select()

        if (error) {
          console.error("Error adding memory:", error)
          return NextResponse.json({ error: "Failed to add memory" }, { status: 500 })
        }

        return NextResponse.json({ memory: data[0] })
      }

      case "get": {
        const { aiMemberId, limit = 10, category } = body
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
          return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 })
        }

        return NextResponse.json({ memories: data })
      }

      case "search": {
        const { query, aiMemberId, limit = 5, category } = body
        if (!query) {
          return NextResponse.json({ error: "Query is required" }, { status: 400 })
        }

        // Get all memories for this user (and optionally AI member)
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
          return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 })
        }

        if (!allMemories || allMemories.length === 0) {
          return NextResponse.json({ memories: [] })
        }

        // Calculate relevance scores for each memory
        const scoredMemories = allMemories.map((memory) => {
          // Base score starts at 0
          let score = 0

          // 1. Content relevance - check if query terms appear in the memory
          const queryTerms = query
            .toLowerCase()
            .split(/\s+/)
            .filter((term: string) => term.length > 2)
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

        return NextResponse.json({ memories: sortedMemories })
      }

      case "generate": {
        const { content, aiMemberId, category } = body
        if (!content) {
          return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }

        // Get relevant memories
        let searchQuery = supabase.from("fm_memories").select("*").eq("user_id", userId)

        if (aiMemberId) {
          searchQuery = searchQuery.eq("ai_member_id", aiMemberId)
        }

        if (category) {
          searchQuery = searchQuery.eq("category", category)
        }

        const { data: allMemories, error: searchError } = await searchQuery

        if (searchError) {
          console.error("Error searching memories:", searchError)
          return NextResponse.json({ error: "Failed to search memories" }, { status: 500 })
        }

        // Calculate relevance scores for each memory
        const queryTerms = content
          .toLowerCase()
          .split(/\s+/)
          .filter((term) => term.length > 2)

        const scoredMemories = allMemories.map((memory) => {
          let score = 0
          const memoryContent = memory.content.toLowerCase()

          // Score based on term matches
          for (const term of queryTerms) {
            if (memoryContent.includes(term)) {
              score += 5
              if (memoryContent.startsWith(term)) {
                score += 3
              }
            }
          }

          // Recency factor
          const memoryAge = Date.now() - new Date(memory.created_at).getTime()
          const recencyScore = Math.max(10 - Math.floor(memoryAge / (1000 * 60 * 60 * 24)), 0)
          score += recencyScore

          return {
            ...memory,
            relevance_score: score,
          }
        })

        // Sort by relevance score and take top 7
        const relevantMemories = scoredMemories.sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 7)

        // Get category prompt template if available
        let promptTemplate = "You are a helpful AI assistant with memory capabilities."
        if (category) {
          const { data: categoryData, error: categoryError } = await supabase
            .from("fm_memory_categories")
            .select("prompt_template")
            .eq("name", category)
            .eq("user_id", userId)
            .single()

          if (!categoryError && categoryData && categoryData.prompt_template) {
            promptTemplate = categoryData.prompt_template
          }
        }

        // Format memories for context
        const formattedMemories = relevantMemories
          .map((memory, index) => {
            const date = new Date(memory.created_at).toLocaleDateString()
            const relevance = memory.relevance_score ? ` (relevance: ${memory.relevance_score})` : ""
            const memCategory = memory.category ? ` [Category: ${memory.category}]` : ""
            return `[Memory ${index + 1}]${relevance}${memCategory} ${date}: ${memory.content}`
          })
          .join("\n\n")

        // Create system prompt
        const systemPrompt = `${promptTemplate}

You have access to the following relevant memories from past interactions:

${formattedMemories || "No specific memories found for this query."}

Guidelines for using memories:
1. Prioritize memories with higher relevance scores when they're available
2. Reference specific memories when they directly answer the user's question
3. Use memories to personalize your response and maintain continuity
4. If memories contradict each other, prefer more recent ones
5. If the memories don't contain relevant information, respond based on your general knowledge
6. Don't explicitly mention "Memory 1", "Memory 2", etc. in your response - integrate the information naturally

Current user query: "${content}"
`

        // Generate response
        const { text } = await generateText({
          model: openai(getBestAvailableModel()),
          system: systemPrompt,
          prompt: content,
        })

        // Try to automatically categorize the memory
        let suggestedCategory = category
        if (!suggestedCategory) {
          // Simple keyword-based categorization
          const combinedContent = `${content} ${text}`.toLowerCase()
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
              if (combinedContent.includes(keyword)) {
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
          suggestedCategory = highestMatches >= 2 ? bestCategory : null
        }

        // Store the interaction as a new memory
        await supabase.from("fm_memories").insert({
          content: `User asked: "${content}". Assistant responded about: ${text.substring(0, 100)}...`,
          user_id: userId,
          ai_member_id: aiMemberId || null,
          category: suggestedCategory,
        })

        return NextResponse.json({
          text,
          memories: relevantMemories,
          memoryCount: relevantMemories.length,
          suggestedCategory,
          usedCategory: category || null,
          usedPromptTemplate: category ? true : false,
        })
      }

      case "stats": {
        const { aiMemberId } = body

        // Get total memory count
        let countQuery = supabase.from("fm_memories").select("id", { count: "exact" }).eq("user_id", userId)
        if (aiMemberId) {
          countQuery = countQuery.eq("ai_member_id", aiMemberId)
        }
        const { count, error: countError } = await countQuery

        if (countError) {
          console.error("Error getting memory count:", countError)
          return NextResponse.json({ error: "Failed to get memory statistics" }, { status: 500 })
        }

        // Get oldest and newest memory dates
        let timeQuery = supabase.from("fm_memories").select("created_at").eq("user_id", userId)
        if (aiMemberId) {
          timeQuery = timeQuery.eq("ai_member_id", aiMemberId)
        }

        const oldestQuery = await timeQuery.order("created_at", { ascending: true }).limit(1)
        const newestQuery = await timeQuery.order("created_at", { ascending: false }).limit(1)

        const oldestDate = oldestQuery.data && oldestQuery.data.length > 0 ? oldestQuery.data[0].created_at : null
        const newestDate = newestQuery.data && newestQuery.data.length > 0 ? newestQuery.data[0].created_at : null

        // Get category distribution
        const categoryDistribution = []
        try {
          // First get all distinct categories
          const { data: distinctCategories, error: distinctError } = await supabase
            .from("fm_memories")
            .select("category")
            .eq("user_id", userId)
            .is("category", "not.null") // Only get non-null categories
            .not("category", "eq", "") // Exclude empty strings

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

        return NextResponse.json({
          stats: {
            count: count || 0,
            oldestDate,
            newestDate,
            timeSpan: oldestDate && newestDate ? new Date(newestDate).getTime() - new Date(oldestDate).getTime() : 0,
            categoryDistribution,
          },
        })
      }

      case "getCategories": {
        const { data, error } = await supabase
          .from("fm_memory_categories")
          .select("*")
          .eq("user_id", userId)
          .order("name", { ascending: true })

        if (error) {
          console.error("Error fetching memory categories:", error)
          return NextResponse.json({ error: "Failed to fetch memory categories" }, { status: 500 })
        }

        return NextResponse.json({ categories: data })
      }

      case "createCategory": {
        const { category } = body
        if (!category || !category.name) {
          return NextResponse.json({ error: "Category name is required" }, { status: 400 })
        }

        const { data, error } = await supabase.from("fm_memory_categories").insert(category).select()

        if (error) {
          console.error("Error creating memory category:", error)
          return NextResponse.json({ error: "Failed to create memory category" }, { status: 500 })
        }

        return NextResponse.json({ category: data[0] })
      }

      case "updateMemoryCategory": {
        const { memoryId, category } = body
        if (!memoryId) {
          return NextResponse.json({ error: "Memory ID is required" }, { status: 400 })
        }

        const { data, error } = await supabase.from("fm_memories").update({ category }).eq("id", memoryId).select()

        if (error) {
          console.error("Error updating memory category:", error)
          return NextResponse.json({ error: "Failed to update memory category" }, { status: 500 })
        }

        return NextResponse.json({ memory: data[0] })
      }

      case "updateCategoryPromptTemplate": {
        const { categoryId, promptTemplate } = body
        if (!categoryId) {
          return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
        }

        const { data, error } = await supabase
          .from("fm_memory_categories")
          .update({ prompt_template: promptTemplate })
          .eq("id", categoryId)
          .select()

        if (error) {
          console.error("Error updating category prompt template:", error)
          return NextResponse.json({ error: "Failed to update category prompt template" }, { status: 500 })
        }

        return NextResponse.json({ category: data[0] })
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
