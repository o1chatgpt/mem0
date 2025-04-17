export interface AIFamilyMember {
  id: string
  name: string
  specialty: string
  description?: string
  avatarUrl?: string
  color?: string
  model?: string
  fallbackModel?: string
  capabilities?: string[]
  systemPrompt?: string
  isActive?: boolean
  role?: string
}

// Export with uppercase name for backward compatibility
export const AI_FAMILY_MEMBERS: AIFamilyMember[] = [
  {
    id: "stan",
    name: "Stan",
    role: "Technical Lead",
    specialty: "Programming & Development",
    description: "Stan is the technical expert who helps with coding, development, and technical problem-solving.",
    avatarUrl: "/avatars/stan.png",
    color: "#3b82f6",
    isActive: true,
  },
  {
    id: "lyra",
    name: "Lyra",
    role: "Home Assistant",
    specialty: "Home Management & Organization",
    description: "Lyra specializes in home-related tasks, organization, and providing a supportive presence.",
    avatarUrl: "/avatars/lyra.png",
    color: "#8b5cf6",
    isActive: true,
  },
  {
    id: "sophia",
    name: "Sophia",
    role: "Creative Director",
    specialty: "Content Creation & Design",
    description: "Sophia excels at creative tasks, content creation, and bringing innovative ideas to life.",
    avatarUrl: "/avatars/sophia.png",
    color: "#ec4899",
    isActive: true,
  },
  {
    id: "max",
    name: "Max",
    role: "Education Specialist",
    specialty: "Learning & Knowledge",
    description: "Max focuses on educational content, research, and helping with learning new subjects.",
    avatarUrl: "/avatars/max.png",
    color: "#f59e0b",
    isActive: true,
  },
]

export function getAIFamilyMembers(): AIFamilyMember[] {
  return AI_FAMILY_MEMBERS
}

export function getAIFamilyMember(id: string): AIFamilyMember | undefined {
  return AI_FAMILY_MEMBERS.find((member) => member.id === id)
}
