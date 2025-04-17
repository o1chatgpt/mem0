import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"
import type { VoiceAssignment, VoiceService, AIFamilyVoiceProfile } from "./schema/voice-assignments"

// Get all voice services
export async function getVoiceServices(): Promise<VoiceService[]> {
  const supabase = createClient(cookies())

  const { data, error } = await supabase.from("voice_services").select("*").order("name")

  if (error) {
    console.error("Error fetching voice services:", error)
    return []
  }

  return data || []
}

// Get a specific voice service
export async function getVoiceService(id: string): Promise<VoiceService | null> {
  const supabase = createClient(cookies())

  const { data, error } = await supabase.from("voice_services").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching voice service ${id}:`, error)
    return null
  }

  return data
}

// Get default voice service
export async function getDefaultVoiceService(): Promise<VoiceService | null> {
  const supabase = createClient(cookies())

  const { data, error } = await supabase.from("voice_services").select("*").eq("isDefault", true).single()

  if (error) {
    // If no default is set, get the first active service
    const { data: firstActive } = await supabase
      .from("voice_services")
      .select("*")
      .eq("isActive", true)
      .limit(1)
      .single()

    return firstActive || null
  }

  return data
}

// Update voice service
export async function updateVoiceService(
  id: string,
  data: Partial<VoiceService>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(cookies())

  // If setting this service as default, unset any existing defaults
  if (data.isDefault) {
    await supabase.from("voice_services").update({ isDefault: false }).neq("id", id)
  }

  const { error } = await supabase
    .from("voice_services")
    .update({ ...data, updatedAt: new Date() })
    .eq("id", id)

  if (error) {
    console.error(`Error updating voice service ${id}:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath("/voice-services")
  revalidatePath(`/voice-services/${id}`)

  return { success: true }
}

// Get voice assignments for an AI family member
export async function getVoiceAssignmentsForAIFamilyMember(aiFamilyMemberId: string): Promise<VoiceAssignment[]> {
  const supabase = createClient(cookies())

  const { data, error } = await supabase
    .from("voice_assignments")
    .select("*")
    .eq("aiFamilyMemberId", aiFamilyMemberId)
    .order("createdAt", { ascending: false })

  if (error) {
    console.error(`Error fetching voice assignments for AI family member ${aiFamilyMemberId}:`, error)
    return []
  }

  return data || []
}

// Get voice profile for an AI family member
export async function getVoiceProfileForAIFamilyMember(aiFamilyMemberId: string): Promise<AIFamilyVoiceProfile | null> {
  const supabase = createClient(cookies())

  // Get the voice profile
  const { data: profile, error: profileError } = await supabase
    .from("ai_family_voice_profiles")
    .select("*")
    .eq("aiFamilyMemberId", aiFamilyMemberId)
    .single()

  if (profileError && profileError.code !== "PGRST116") {
    console.error(`Error fetching voice profile for AI family member ${aiFamilyMemberId}:`, profileError)
    return null
  }

  // Get the voice assignments
  const assignments = await getVoiceAssignmentsForAIFamilyMember(aiFamilyMemberId)

  // If no profile exists yet, create a default one
  if (!profile) {
    return {
      aiFamilyMemberId,
      voiceAssignments: assignments,
      defaultVoiceAssignmentId: assignments.length > 0 ? assignments[0].id : undefined,
    }
  }

  return {
    ...profile,
    voiceAssignments: assignments,
  }
}

// Create or update a voice assignment
export async function createOrUpdateVoiceAssignment(
  assignment: Partial<VoiceAssignment> & { aiFamilyMemberId: string },
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createClient(cookies())

  const isNew = !assignment.id
  const id = assignment.id || uuidv4()
  const now = new Date()

  const data = {
    ...assignment,
    id,
    updatedAt: now,
    ...(isNew && { createdAt: now }),
  }

  // If setting this assignment as default, update the profile
  if (assignment.isDefault) {
    // First, get or create the profile
    const { data: existingProfile } = await supabase
      .from("ai_family_voice_profiles")
      .select("*")
      .eq("aiFamilyMemberId", assignment.aiFamilyMemberId)
      .single()

    if (existingProfile) {
      await supabase
        .from("ai_family_voice_profiles")
        .update({ defaultVoiceAssignmentId: id })
        .eq("aiFamilyMemberId", assignment.aiFamilyMemberId)
    } else {
      await supabase.from("ai_family_voice_profiles").insert({
        aiFamilyMemberId: assignment.aiFamilyMemberId,
        defaultVoiceAssignmentId: id,
      })
    }

    // Also update any other assignments to not be default
    await supabase
      .from("voice_assignments")
      .update({ isDefault: false })
      .eq("aiFamilyMemberId", assignment.aiFamilyMemberId)
      .neq("id", id)
  }

  // Insert or update the assignment
  const { error } = isNew
    ? await supabase.from("voice_assignments").insert(data)
    : await supabase.from("voice_assignments").update(data).eq("id", id)

  if (error) {
    console.error(`Error ${isNew ? "creating" : "updating"} voice assignment:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath("/voice-services")
  revalidatePath("/ai-family")
  revalidatePath(`/ai-family/${assignment.aiFamilyMemberId}`)

  return { success: true, id }
}

// Delete a voice assignment
export async function deleteVoiceAssignment(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(cookies())

  // First, check if this is a default assignment
  const { data: assignment } = await supabase.from("voice_assignments").select("*").eq("id", id).single()

  if (assignment && assignment.isDefault) {
    // Find another assignment to make default
    const { data: otherAssignments } = await supabase
      .from("voice_assignments")
      .select("*")
      .eq("aiFamilyMemberId", assignment.aiFamilyMemberId)
      .neq("id", id)
      .limit(1)

    if (otherAssignments && otherAssignments.length > 0) {
      // Make another assignment default
      await createOrUpdateVoiceAssignment({
        ...otherAssignments[0],
        isDefault: true,
      })
    } else {
      // Update the profile to remove the default assignment
      await supabase
        .from("ai_family_voice_profiles")
        .update({ defaultVoiceAssignmentId: null })
        .eq("aiFamilyMemberId", assignment.aiFamilyMemberId)
    }
  }

  // Delete the assignment
  const { error } = await supabase.from("voice_assignments").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting voice assignment ${id}:`, error)
    return { success: false, error: error.message }
  }

  revalidatePath("/voice-services")
  revalidatePath("/ai-family")

  return { success: true }
}
