export interface FamilyMember {
  id: string
  name: string
  avatar?: string
  role: string
  description?: string
  createdAt: string
  lastAccessed?: string
}

export interface VectorStore {
  familyMemberId: string
  memories: MemoryItem[]
}

export interface MemoryItem {
  id: string
  content: string
  embedding?: number[]
  metadata: {
    timestamp: string
    source: string
    type: string
  }
}
