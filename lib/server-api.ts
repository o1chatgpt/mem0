import { config } from "./config"

export class ServerApiClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey = config.serverApiKey, baseUrl = config.apiBaseUrl) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
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

// Create a singleton instance
export const serverApi = new ServerApiClient()
