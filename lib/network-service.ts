import { config } from "./config"

export interface NetworkServer {
  name: string
  url: string
  apiKey: string
  status?: "online" | "offline" | "unknown"
}

export interface NetworkFile {
  id: string
  name: string
  path: string
  type: string
  size: string
  sizeInBytes: number
  lastModified: string
  serverId: string
  serverName: string
}

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

export class NetworkService {
  private servers: NetworkServer[]

  constructor() {
    this.servers = config.networkServers || []
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch (error) {
      return false
    }
  }

  async getServers(): Promise<NetworkServer[]> {
    // Skip API calls on server-side
    if (!isBrowser) {
      return this.servers.map((server) => ({
        ...server,
        status: "unknown" as const,
      }))
    }

    // Check status of each server
    const serversWithStatus = await Promise.all(
      this.servers.map(async (server) => {
        try {
          if (!this.isValidUrl(server.url)) {
            console.warn(`Invalid URL for server ${server.name}: ${server.url}`)
            return { ...server, status: "offline" as const }
          }

          const response = await fetch(`${server.url}/api/status`, {
            headers: {
              Authorization: `Bearer ${server.apiKey}`,
            },
            // Short timeout to prevent long waits
            signal: AbortSignal.timeout(3000),
          })

          if (!response.ok) {
            return { ...server, status: "offline" as const }
          } else {
            return { ...server, status: "online" as const }
          }
        } catch (error) {
          console.error(`Error checking server ${server.name}:`, error)
          let status: "offline" | "unknown" = "unknown"

          // Check if the error is a TypeError indicating a network issue
          if (error instanceof TypeError) {
            console.warn(`Network error checking server ${server.name}: ${error.message}`)
            status = "offline"
          } else {
            console.warn(`Non-network error checking server ${server.name}: ${error}`)
            status = "unknown"
          }
          return { ...server, status: status as const }
        }
      }),
    )

    return serversWithStatus
  }

  async searchAcrossServers(query: string): Promise<NetworkFile[]> {
    // Skip API calls on server-side
    if (!isBrowser) {
      return []
    }

    const servers = await this.getServers()
    const onlineServers = servers.filter((server) => server.status === "online")

    const results = await Promise.all(
      onlineServers.map(async (server) => {
        try {
          const response = await fetch(`${server.url}/api/search?q=${encodeURIComponent(query)}`, {
            headers: {
              Authorization: `Bearer ${server.apiKey}`,
            },
          })

          if (!response.ok) {
            return []
          }

          const data = await response.json()

          // Add server info to each file
          return data.files.map((file: any) => ({
            ...file,
            serverId: server.url,
            serverName: server.name,
          }))
        } catch (error) {
          console.error(`Error searching server ${server.name}:`, error)
          return []
        }
      }),
    )

    // Flatten results
    return results.flat()
  }

  async getFileFromServer(serverId: string, fileId: string): Promise<any> {
    // Skip API calls on server-side
    if (!isBrowser) {
      return null
    }

    const server = this.servers.find((s) => s.url === serverId)

    if (!server) {
      throw new Error(`Server ${serverId} not found`)
    }

    const response = await fetch(`${server.url}/api/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${server.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get file from server ${server.name}`)
    }

    return response.json()
  }
}

export const networkService = new NetworkService()
