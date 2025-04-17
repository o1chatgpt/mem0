import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIFamilyVoiceManager } from "@/components/ai-family-voice-manager"
import { getAIFamilyMembers } from "@/lib/db/ai-family"
import { getVoiceServices, getVoiceProfileForAIFamilyMember } from "@/lib/db/voice-assignments"

export default async function AIFamilyVoicesPage() {
  // Get all AI family members
  const aiFamilyMembers = await getAIFamilyMembers()

  // Get all voice services
  const voiceServices = await getVoiceServices()

  // Map voice services to the format expected by the component
  const formattedVoiceServices = voiceServices.map((service) => {
    // Define available voices for each service
    const voicesMap: Record<string, string[]> = {
      openai: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
      elevenlabs: ["Rachel", "Domi", "Bella", "Antoni", "Thomas", "Charlie"],
      hume: ["Calm", "Cheerful", "Excited", "Friendly", "Sad", "Serious"],
    }

    return {
      id: service.id,
      name: service.name,
      isActive: service.isActive,
      voices: voicesMap[service.id] || [],
    }
  })

  // Get voice profiles for each AI family member
  const voiceProfiles = await Promise.all(
    aiFamilyMembers.map(async (member) => {
      const profile = await getVoiceProfileForAIFamilyMember(member.id)

      return {
        member,
        profile,
        assignments: profile?.voiceAssignments || [],
        defaultAssignmentId: profile?.defaultVoiceAssignmentId,
      }
    }),
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">AI Family Voice Management</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Voice Assignments</CardTitle>
          <CardDescription>
            Manage voice assignments for each AI family member. Each member can have multiple voice options, with one
            set as the default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={aiFamilyMembers[0]?.id}>
            <TabsList className="mb-4">
              {aiFamilyMembers.map((member) => (
                <TabsTrigger key={member.id} value={member.id}>
                  {member.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {voiceProfiles.map(({ member, assignments, defaultAssignmentId }) => (
              <TabsContent key={member.id} value={member.id}>
                <AIFamilyVoiceManager
                  aiFamilyMember={member}
                  voiceServices={formattedVoiceServices}
                  initialAssignments={assignments}
                  defaultAssignmentId={defaultAssignmentId}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
