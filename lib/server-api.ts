import { config } from "./config"

export class ServerApiClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string, baseUrl?: string) {
    // Defer accessing config until the constructor is called
    this.apiKey = apiKey || config.serverApiKey
    this.baseUrl = baseUrl || config.apiBaseUrl
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Server API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // File operations
  async listFiles(path: string) {
    return this.fetchWithAuth(`/files?path=${encodeURIComponent(path)}`)
  }

  async getFile(path: string) {
    return this.fetchWithAuth(`/file?path=${encodeURIComponent(path)}`)
  }

  async createFile(path: string, content: string) {
    return this.fetchWithAuth("/file", {
      method: "POST",
      body: JSON.stringify({ path, content }),
    })
  }

  async updateFile(path: string, content: string) {
    return this.fetchWithAuth("/file", {
      method: "PUT",
      body: JSON.stringify({ path, content }),
    })
  }

  async deleteFile(path: string) {
    return this.fetchWithAuth("/file", {
      method: "DELETE",
      body: JSON.stringify({ path }),
    })
  }

  async uploadFile(path: string, file: File) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", path)

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Server API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Server status
  async getServerStatus() {
    return this.fetchWithAuth("/status")
  }
}

// Create a lazy-loaded singleton instance
let serverApiInstance: ServerApiClient | null = null
export const serverApi = new Proxy({} as ServerApiClient, {
  get: (target, prop) => {
    if (!serverApiInstance) {
      serverApiInstance = new ServerApiClient()
    }
    return serverApiInstance[prop as keyof ServerApiClient]
  },
})
