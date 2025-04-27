import { config } from "./config"

export interface ApiPartner {
  id: string
  name: string
  apiKey: string
  permissions: string[]
  createdAt: Date
  expiresAt?: Date
  lastUsed?: Date
  usageCount: number
}

export class ApiKeyService {
  private partners: ApiPartner[]

  constructor() {
    // Initialize with partners from config
    this.partners = (config.apiPartners || []).map((partner, index) => ({
      id: `partner-${index + 1}`,
      name: partner.name,
      apiKey: partner.apiKey,
      permissions: partner.permissions || [],
      createdAt: new Date(),
      expiresAt: partner.expiresAt ? new Date(partner.expiresAt) : undefined,
      lastUsed: undefined,
      usageCount: 0,
    }))
  }

  getAllPartners(): ApiPartner[] {
    return [...this.partners]
  }

  getPartnerById(id: string): ApiPartner | undefined {
    return this.partners.find((partner) => partner.id === id)
  }

  getPartnerByApiKey(apiKey: string): ApiPartner | undefined {
    const partner = this.partners.find((partner) => partner.apiKey === apiKey)

    if (partner) {
      // Update usage statistics
      partner.lastUsed = new Date()
      partner.usageCount++
    }

    return partner
  }

  validateApiKey(apiKey: string, requiredPermission?: string): boolean {
    const partner = this.getPartnerByApiKey(apiKey)

    if (!partner) {
      return false
    }

    // Check if the key has expired
    if (partner.expiresAt && partner.expiresAt < new Date()) {
      return false
    }

    // Check permission if required
    if (requiredPermission && !partner.permissions.includes(requiredPermission)) {
      return false
    }

    return true
  }

  addPartner(partner: Omit<ApiPartner, "id" | "createdAt" | "lastUsed" | "usageCount">): ApiPartner {
    const id = `partner-${this.partners.length + 1}`

    const newPartner: ApiPartner = {
      id,
      name: partner.name,
      apiKey: partner.apiKey,
      permissions: partner.permissions,
      createdAt: new Date(),
      expiresAt: partner.expiresAt,
      lastUsed: undefined,
      usageCount: 0,
    }

    this.partners.push(newPartner)
    return newPartner
  }

  updatePartner(id: string, updates: Partial<Omit<ApiPartner, "id" | "createdAt">>): ApiPartner | null {
    const index = this.partners.findIndex((partner) => partner.id === id)

    if (index === -1) {
      return null
    }

    const updatedPartner = {
      ...this.partners[index],
      ...updates,
    }

    this.partners[index] = updatedPartner
    return updatedPartner
  }

  deletePartner(id: string): boolean {
    const initialLength = this.partners.length
    this.partners = this.partners.filter((partner) => partner.id !== id)
    return this.partners.length < initialLength
  }

  generateApiKey(): string {
    // Generate a random API key
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }
}

export const apiKeyService = new ApiKeyService()
