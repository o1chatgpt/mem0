import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createEmbedding } from "@/services/vector-store"

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Sample memories for Mem0
const MEM0_MEMORIES = [
  "User mentioned they prefer dark mode interfaces in applications.",
  "User's favorite color is blue, as mentioned in our conversation on April 15.",
  "User is allergic to peanuts and prefers vegetarian food options.",
  "User is working on a machine learning project for image classification.",
  "User mentioned they have a dog named Max, a golden retriever.",
  "User prefers concise explanations with examples rather than lengthy theoretical discussions.",
  "User is planning a trip to Japan next summer and is interested in cultural recommendations.",
  "User is a software developer specializing in React and TypeScript.",
  "User mentioned they enjoy science fiction books, particularly works by Isaac Asimov.",
  "User is learning Spanish and appreciates when I incorporate Spanish phrases occasionally.",
  "User prefers to receive information in bullet points for better readability.",
  "User mentioned they work remotely and are in the PST timezone.",
  "User has expressed interest in improving their public speaking skills.",
  "User mentioned they exercise regularly, primarily through running and yoga.",
  "User prefers to receive code examples in TypeScript rather than JavaScript.",
]

export async function GET() {
  try {
    // Delete existing Mem0 memories
    await supabase.from("ai_family_member_memories").delete().eq("ai_family_member_id", "mem0")

    // Insert new memories with embeddings
    for (const memory of MEM0_MEMORIES) {
      // Create embedding for the memory
      const embedding = await createEmbedding(memory)

      if (!embedding) {
        console.error(`Failed to create embedding for memory: ${memory}`)
        continue
      }

      const { error } = await supabase.from("ai_family_member_memories").insert([
        {
          ai_family_member_id: "mem0",
          user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
          memory,
          embedding,
        },
      ])

      if (error) {
        console.error(`Error inserting memory for Mem0:`, error)
      }
    }

    return NextResponse.json({ success: true, message: "Mem0 memories seeded successfully" })
  } catch (error) {
    console.error("Error seeding Mem0 memories:", error)
    return NextResponse.json({ success: false, error: "Failed to seed Mem0 memories" }, { status: 500 })
  }
}
