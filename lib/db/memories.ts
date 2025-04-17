import { sql } from "@vercel/postgres"
import { v4 as uuidv4 } from "uuid"

export interface AIFamilyMemberMemory {
  id: string
  ai_family_member_id: string
  user_id: string
  memory: string
  relevance: number
  created_at: Date
  updated_at: Date
}

export async function createMemory(
  ai_family_member_id: string,
  user_id: string,
  memory: string,
  relevance = 1.0,
): Promise<AIFamilyMemberMemory> {
  const id = uuidv4()
  const result = await sql`
    INSERT INTO ai_family_member_memories (
      id, ai_family_member_id, user_id, memory, relevance
    ) VALUES (
      ${id}, ${ai_family_member_id}, ${user_id}, ${memory}, ${relevance}
    )
    RETURNING *
  `

  return result.rows[0] as AIFamilyMemberMemory
}

export async function getMemoriesByUserAndAI(
  user_id: string,
  ai_family_member_id: string,
  limit = 10,
): Promise<AIFamilyMemberMemory[]> {
  const result = await sql`
    SELECT * FROM ai_family_member_memories
    WHERE user_id = ${user_id} AND ai_family_member_id = ${ai_family_member_id}
    ORDER BY relevance DESC, created_at DESC
    LIMIT ${limit}
  `

  return result.rows as AIFamilyMemberMemory[]
}

export async function searchMemories(
  user_id: string,
  ai_family_member_id: string,
  query: string,
  limit = 5,
): Promise<AIFamilyMemberMemory[]> {
  // Simple text search - in a production app, you might want to use a more sophisticated search
  const result = await sql`
    SELECT * FROM ai_family_member_memories
    WHERE user_id = ${user_id} 
    AND ai_family_member_id = ${ai_family_member_id}
    AND memory ILIKE ${"%" + query + "%"}
    ORDER BY relevance DESC, created_at DESC
    LIMIT ${limit}
  `

  return result.rows as AIFamilyMemberMemory[]
}

export async function deleteMemoriesByUser(user_id: string, ai_family_member_id?: string): Promise<number> {
  let result

  if (ai_family_member_id) {
    result = await sql`
      DELETE FROM ai_family_member_memories
      WHERE user_id = ${user_id} AND ai_family_member_id = ${ai_family_member_id}
      RETURNING id
    `
  } else {
    result = await sql`
      DELETE FROM ai_family_member_memories
      WHERE user_id = ${user_id}
      RETURNING id
    `
  }

  return result.rowCount
}
