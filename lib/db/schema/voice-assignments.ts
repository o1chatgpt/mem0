import { z } from "zod"

// Voice service schema
export const voiceServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  apiKey: z.string().optional(),
  defaultVoice: z.string().optional(),
  settings: z.record(z.any()).default({}),
})

export type VoiceService = z.infer<typeof voiceServiceSchema>

// Voice assignment schema
export const voiceAssignmentSchema = z.object({
  id: z.string(),
  aiFamilyMemberId: z.string(),
  voiceServiceId: z.string(),
  voiceId: z.string(),
  settings: z
    .object({
      speed: z.number().default(1.0),
      pitch: z.number().optional(),
      stability: z.number().optional(),
      clarity: z.number().optional(),
      emotion: z.string().optional(),
    })
    .default({}),
  isDefault: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
})

export type VoiceAssignment = z.infer<typeof voiceAssignmentSchema>

// AI Family member voice profile schema
export const aiFamilyVoiceProfileSchema = z.object({
  aiFamilyMemberId: z.string(),
  defaultVoiceAssignmentId: z.string().optional(),
  voiceAssignments: z.array(voiceAssignmentSchema).default([]),
  voicePersonality: z.string().optional(),
  voiceStyle: z.string().optional(),
  customPrompt: z.string().optional(),
})

export type AIFamilyVoiceProfile = z.infer<typeof aiFamilyVoiceProfileSchema>
