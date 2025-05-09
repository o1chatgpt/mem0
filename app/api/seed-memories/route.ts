import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Sample memories for each AI family member
const SAMPLE_MEMORIES: Record<string, string[]> = {
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
    // Fetch AI family members
    const { data: aiMembers, error: membersError } = await supabase.from("ai_family_members").select("id, name")

    if (membersError) {
      console.error("Error fetching AI family members:", membersError)
      // Use fallback data if we can't fetch from the database
      const fallbackMembers = [
        { id: "lyra", name: "Lyra" },
        { id: "sophia", name: "Sophia" },
        { id: "kara", name: "Kara" },
        { id: "stan", name: "Stan" },
        { id: "dan", name: "DAN" },
      ]

      // Insert memories for fallback members
      for (const member of fallbackMembers) {
        const memories = SAMPLE_MEMORIES[member.id] || [
          `${member.name} helped a user with a complex problem.`,
          `${member.name} provided valuable insights on a difficult topic.`,
          `${member.name} answered questions clearly and concisely.`,
        ]

        for (const memory of memories) {
          try {
            await supabase.from("ai_family_member_memories").insert([
              {
                ai_family_member_id: member.id,
                memory,
                user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
              },
            ])
          } catch (insertError) {
            console.error(`Error inserting memory for ${member.id}:`, insertError)
            // Continue with the next memory even if this one fails
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Memories seeded with fallback data",
        warning: "Could not fetch AI family members from database",
      })
    }

    if (!aiMembers || aiMembers.length === 0) {
      return NextResponse.json({ success: false, error: "No AI family members found" }, { status: 404 })
    }

    // Clear existing memories
    await supabase.from("ai_family_member_memories").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    // Insert new memories for each AI family member
    for (const member of aiMembers) {
      // Get sample memories for this member or use default memories
      const memberId = member.id.toLowerCase()
      const memories = SAMPLE_MEMORIES[memberId] || [
        `${member.name} helped a user with a complex problem.`,
        `${member.name} provided valuable insights on a difficult topic.`,
        `${member.name} answered questions clearly and concisely.`,
      ]

      for (const memory of memories) {
        try {
          await supabase.from("ai_family_member_memories").insert([
            {
              ai_family_member_id: member.id,
              memory,
              user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
            },
          ])
        } catch (insertError) {
          console.error(`Error inserting memory for ${member.id}:`, insertError)
          // Continue with the next memory even if this one fails
        }
      }
    }

    return NextResponse.json({ success: true, message: "Memories seeded successfully" })
  } catch (error) {
    console.error("Error seeding memories:", error)
    return NextResponse.json({ success: false, error: "Failed to seed memories" }, { status: 500 })
  }
}
