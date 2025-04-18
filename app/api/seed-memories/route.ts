import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Hardcoded AI family members with UUIDs
const AI_FAMILY_MEMBERS = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Lyra",
    code: "lyra",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Sophia",
    code: "sophia",
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "Kara",
    code: "kara",
  },
  {
    id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    name: "Stan",
    code: "stan",
  },
  {
    id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    name: "DAN",
    code: "dan",
  },
]

// Sample memories for each AI family member
const SAMPLE_MEMORIES = {
  lyra: [
    "Lyra enjoys discussing classical music, particularly Bach and Mozart.",
    "Lyra helped a user write a poem about autumn leaves last week.",
    "Lyra recommended 'The Starry Night' by Van Gogh as an example of expressive brushwork.",
    "Lyra discussed the symbolism in T.S. Eliot's 'The Waste Land' with a literature student.",
  ],
  sophia: [
    "Sophia explained quantum entanglement to a physics student yesterday.",
    "Sophia discussed Kant's categorical imperative and its modern applications.",
    "Sophia helped a user understand the scientific method and experimental design.",
    "Sophia recommended several academic papers on climate science for a research project.",
  ],
  kara: [
    "Kara helped a user create a weekly meal planning system.",
    "Kara suggested the Pomodoro technique to improve productivity.",
    "Kara organized a user's digital files using a systematic approach.",
    "Kara created a template for tracking personal finances.",
  ],
  stan: [
    "Stan debugged a complex JavaScript closure issue for a developer.",
    "Stan explained the differences between various cloud hosting options.",
    "Stan helped optimize a database query that was running slowly.",
    "Stan recommended best practices for securing a web application.",
  ],
  dan: [
    "Dan created an unconventional marketing strategy for a startup.",
    "Dan suggested a creative solution to a seemingly impossible design constraint.",
    "Dan proposed an alternative perspective on a controversial topic.",
    "Dan helped a user think outside the box for a brainstorming session.",
  ],
}

export async function GET() {
  try {
    // Clear existing memories
    await supabase.from("ai_family_member_memories").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    // Insert new memories for each AI family member
    for (const member of AI_FAMILY_MEMBERS) {
      const memories = SAMPLE_MEMORIES[member.code as keyof typeof SAMPLE_MEMORIES] || []

      for (const memory of memories) {
        await supabase.from("ai_family_member_memories").insert([
          {
            ai_family_member_id: member.id,
            memory,
            user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
          },
        ])
      }
    }

    return NextResponse.json({ success: true, message: "Memories seeded successfully" })
  } catch (error) {
    console.error("Error seeding memories:", error)
    return NextResponse.json({ success: false, error: "Failed to seed memories" }, { status: 500 })
  }
}
