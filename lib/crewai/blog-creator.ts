import { createServerClient } from "@/lib/db"
import { put } from "@vercel/blob"
import { addMemory } from "@/lib/mem0"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  author_id: number
  featured_image_url: string | null
  tags: string[]
  status: "draft" | "published" | "archived"
  created_at: string
  updated_at: string
  published_at: string | null
  slug: string
}

// Initialize blog tables
export async function initializeBlogTables() {
  const supabase = createServerClient()

  try {
    // Check if fm_blog_posts table exists
    const { count: postsCount, error: postsError } = await supabase
      .from("fm_blog_posts")
      .select("*", { count: "exact", head: true })

    // Create fm_blog_posts table if it doesn't exist
    if (postsError) {
      console.log("Creating fm_blog_posts table...")
      await supabase.rpc("create_table", {
        table_name: "fm_blog_posts",
        table_definition: `
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          author_id INTEGER NOT NULL,
          featured_image_url TEXT,
          tags TEXT[],
          status TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          published_at TIMESTAMP WITH TIME ZONE,
          slug TEXT NOT NULL UNIQUE
        `,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing blog tables:", error)
    return { success: false, error }
  }
}

// Create a new blog post
export async function createBlogPost(post: Omit<BlogPost, "id" | "created_at" | "updated_at">): Promise<BlogPost> {
  const supabase = createServerClient()

  const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  const now = new Date().toISOString()

  // Generate slug if not provided
  const slug = post.slug || generateSlug(post.title)

  const { data, error } = await supabase
    .from("fm_blog_posts")
    .insert({
      id: postId,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author_id: post.author_id,
      featured_image_url: post.featured_image_url,
      tags: post.tags,
      status: post.status,
      created_at: now,
      updated_at: now,
      published_at: post.published_at,
      slug,
    })
    .select()

  if (error) {
    console.error("Error creating blog post:", error)
    throw new Error(`Failed to create blog post: ${error.message}`)
  }

  // Store memory of blog creation
  await addMemory(
    `Created blog post: "${post.title}". Status: ${post.status}.`,
    post.author_id,
    undefined,
    "Content Creation",
  )

  return data[0]
}

// Generate a blog post from scraped content
export async function generateBlogPostFromScraping(
  scrapedData: any,
  userId: number,
  aiMemberId?: number,
  instructions?: string,
): Promise<{ title: string; content: string; excerpt: string }> {
  try {
    // Get a valid API key
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error("No valid OpenAI API key available")
    }

    // Create prompt for AI
    const prompt = `
      I need you to create a blog post based on the following scraped web content.
      
      SCRAPED CONTENT:
      Title: ${scrapedData.title || "Unknown"}
      URL: ${scrapedData.url}
      Description: ${scrapedData.metadata.description || "None"}
      Content: ${scrapedData.content.substring(0, 3000)}...
      
      ${instructions ? `SPECIAL INSTRUCTIONS: ${instructions}` : ""}
      
      Please create a well-structured blog post with:
      1. An engaging title
      2. A brief excerpt/summary (2-3 sentences)
      3. Full blog post content with proper formatting, headings, and paragraphs
      
      Format your response as JSON with the following structure:
      {
        "title": "Your generated title",
        "excerpt": "Your generated excerpt",
        "content": "Your full blog post content with markdown formatting"
      }
    `

    // Generate blog post using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      apiKey,
    })

    // Parse the JSON response
    try {
      const blogData = JSON.parse(text)

      // Store memory of blog generation
      if (userId) {
        await addMemory(
          `Generated blog post from scraped content. Title: "${blogData.title}".`,
          userId,
          aiMemberId,
          "Content Creation",
        )
      }

      return {
        title: blogData.title,
        content: blogData.content,
        excerpt: blogData.excerpt,
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)

      // Fallback: try to extract the parts manually
      const titleMatch = text.match(/["']title["']\s*:\s*["'](.+?)["']/)
      const excerptMatch = text.match(/["']excerpt["']\s*:\s*["'](.+?)["']/)
      const contentMatch = text.match(/["']content["']\s*:\s*["'](.+?)["']/)

      return {
        title: titleMatch?.[1] || "Generated Blog Post",
        excerpt: excerptMatch?.[1] || "Generated from web content.",
        content: contentMatch?.[1] || text,
      }
    }
  } catch (error) {
    console.error("Error generating blog post:", error)
    throw new Error(`Failed to generate blog post: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Upload an image for a blog post
export async function uploadBlogImage(file: File, userId: number): Promise<string> {
  try {
    // Generate a safe filename
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueFileName = `${Date.now()}-${safeFileName}`
    const blobPath = `blog-images/${userId}/${uniqueFileName}`

    // Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading blog image:", error)
    throw new Error(`Failed to upload blog image: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Helper function to generate a slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim()
}
