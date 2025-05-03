// API client for aaPanel
import { config } from "./config"

interface CreateWebsiteParams {
  webname: string
  path: string
  type_id: number
  version: string
  port: number
  ps: string
  ftp?: boolean
  ftp_username?: string
  ftp_password?: string
  sql?: boolean
  codeing?: string
  datauser?: string
  datapassword?: string
}

interface DeleteWebsiteParams {
  id: number
  webname: string
  options: {
    ftp: boolean
    database: boolean
    path: boolean
  }
}

interface SystemInfo {
  system: string
  version: string
  time: string
  cpuNum: number
  cpuRealUsed: number
  memTotal: number
  memRealUsed: number
  memFree: number
  memCached: number
  memBuffers: number
}

interface DiskInfo {
  path: string
  inodes: string[]
  size: string[]
}

interface NetworkInfo {
  load: {
    max: number
    safe: number
    one: number
    five: number
    limit: number
    fifteen: number
  }
  down: number
  downTotal: number
  mem: {
    memFree: number
    memTotal: number
    memCached: number
    memBuffers: number
    memRealUsed: number
  }
  up: number
  upTotal: number
  upPackets: number
  downPackets: number
  cpu: [number, number]
}

// Update the isPreviewEnvironment function to be more robust
const isPreviewEnvironment = () => {
  // Check for Vercel preview environment
  if (typeof window !== "undefined") {
    // Check for localhost or preview domains
    return (
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("preview") ||
      // Add additional check for direct-entry route which should always use demo mode
      window.location.pathname.includes("/direct-entry")
    )
  }
  return true // Default to assuming preview in SSR context for safety
}

class AaPanelClient {
  private apiUrl: string
  private apiKey: string | null = null
  private isDemoMode: boolean

  // Update the constructor to force demo mode in preview environments
  constructor() {
    this.apiUrl = `${config.serverUrl}/api/proxy/aapanel`
    // Immediately set to demo mode if in preview environment
    this.isDemoMode = isPreviewEnvironment()
    console.log(`AaPanelClient initialized in ${this.isDemoMode ? "demo" : "production"} mode`)
  }

  // Set API key
  setApiKey(key: string) {
    this.apiKey = key
  }

  // Get API key
  getApiKey(): string | null {
    return this.apiKey
  }

  // Set demo mode
  setDemoMode(isDemoMode: boolean) {
    this.isDemoMode = isDemoMode
  }

  // Get demo mode status
  getDemoMode(): boolean {
    return this.isDemoMode
  }

  // Improve the request method to better handle network errors
  private async request(endpoint: string, method = "GET", data?: any) {
    // If in demo mode, don't make actual API requests
    if (this.isDemoMode) {
      console.log("Demo mode: Skipping actual API request to", endpoint)
      throw new Error("Demo mode active - API requests are simulated")
    }

    try {
      const url = `${this.apiUrl}${endpoint}`
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (this.apiKey) {
        headers["X-API-Key"] = this.apiKey
      }

      const options: RequestInit = {
        method,
        headers,
        // Add a timeout using AbortController
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error)
      // Re-throw the error with more context
      throw new Error(`Failed to ${method} ${endpoint}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Update the getWebsites method to better handle errors
  async getWebsites() {
    // Always check if we're in a preview environment before making the request
    if (isPreviewEnvironment() || this.isDemoMode) {
      console.log("Demo mode: Returning mock websites")
      this.setDemoMode(true)
      return this.getDemoWebsites()
    }

    try {
      return await this.request("/sites")
    } catch (error) {
      console.log("Falling back to demo websites due to error:", error)
      this.setDemoMode(true)
      return this.getDemoWebsites()
    }
  }

  // Get demo websites (fallback)
  async getDemoWebsites() {
    // Return mock data for demo mode
    return {
      status: true,
      data: [
        {
          id: 1,
          name: "example.com",
          path: "/www/wwwroot/example.com",
          status: "1",
          ps: "Main website",
          addtime: "2023-01-15",
          edate: "2025-01-15",
          domain: 3,
          backup_count: 2,
        },
        {
          id: 2,
          name: "blog.example.com",
          path: "/www/wwwroot/blog.example.com",
          status: "1",
          ps: "Company blog",
          addtime: "2023-02-20",
          edate: "2025-02-20",
          domain: 1,
          backup_count: 1,
        },
        {
          id: 3,
          name: "dev.example.com",
          path: "/www/wwwroot/dev.example.com",
          status: "0",
          ps: "Development site",
          addtime: "2023-03-10",
          edate: "2025-03-10",
          domain: 1,
          backup_count: 0,
        },
      ],
    }
  }

  // Get PHP versions with improved error handling
  async getPhpVersions() {
    if (this.isDemoMode) {
      console.log("Demo mode: Returning default PHP versions")
      return [
        { version: "74", name: "PHP 7.4" },
        { version: "80", name: "PHP 8.0" },
        { version: "81", name: "PHP 8.1" },
        { version: "82", name: "PHP 8.2" },
      ]
    }

    try {
      const response = await this.request("/php/versions")
      return response.data || []
    } catch (error) {
      console.log("Using default PHP versions due to error:", error)
      // Return default PHP versions if API fails
      return [
        { version: "74", name: "PHP 7.4" },
        { version: "80", name: "PHP 8.0" },
        { version: "81", name: "PHP 8.1" },
        { version: "82", name: "PHP 8.2" },
      ]
    }
  }

  // Get site types with improved error handling
  async getSiteTypes() {
    if (this.isDemoMode) {
      console.log("Demo mode: Returning default site types")
      return [
        { id: 0, name: "Static" },
        { id: 1, name: "PHP" },
        { id: 2, name: "Node.js" },
      ]
    }

    try {
      const response = await this.request("/sites/types")
      return response.data || []
    } catch (error) {
      console.log("Using default site types due to error:", error)
      // Return default site types if API fails
      return [
        { id: 0, name: "Static" },
        { id: 1, name: "PHP" },
        { id: 2, name: "Node.js" },
      ]
    }
  }

  // Create website
  async createWebsite(params: CreateWebsiteParams) {
    if (this.isDemoMode) {
      console.log("Demo mode: Simulating website creation", params)
      // Simulate a successful response
      return { status: true, message: "Website created successfully (Demo Mode)" }
    }
    return this.request("/sites/create", "POST", params)
  }

  // Delete website
  async deleteWebsite(id: number, webname: string, options: { ftp: boolean; database: boolean; path: boolean }) {
    if (this.isDemoMode) {
      console.log("Demo mode: Simulating website deletion", { id, webname, options })
      // Simulate a successful response
      return { status: true, message: "Website deleted successfully (Demo Mode)" }
    }
    return this.request("/sites/delete", "POST", { id, webname, options })
  }

  // Start website
  async startWebsite(id: number, name: string) {
    if (this.isDemoMode) {
      console.log("Demo mode: Simulating website start", { id, name })
      // Simulate a successful response
      return { status: true, message: "Website started successfully (Demo Mode)" }
    }
    return this.request("/sites/start", "POST", { id, name })
  }

  // Stop website
  async stopWebsite(id: number, name: string) {
    if (this.isDemoMode) {
      console.log("Demo mode: Simulating website stop", { id, name })
      // Simulate a successful response
      return { status: true, message: "Website stopped successfully (Demo Mode)" }
    }
    return this.request("/sites/stop", "POST", { id, name })
  }

  // Create website backup
  async createWebsiteBackup(id: number) {
    if (this.isDemoMode) {
      console.log("Demo mode: Simulating website backup", { id })
      // Simulate a successful response
      return { status: true, message: "Website backup created successfully (Demo Mode)" }
    }
    return this.request("/sites/backup", "POST", { id })
  }

  // Get system total information - Added to fix the missing method error
  async getSystemTotal(): Promise<SystemInfo> {
    if (this.isDemoMode) {
      console.log("Demo mode: Returning mock system information")
      // Return mock system information
      return {
        system: "Linux CentOS 7.9.2009 x86_64",
        version: "7.9.3",
        time: "31 days, 5 hours, 27 minutes",
        cpuNum: 4,
        cpuRealUsed: 23.5,
        memTotal: 16384,
        memRealUsed: 8192,
        memFree: 6144,
        memCached: 1536,
        memBuffers: 512,
      }
    }

    try {
      const response = await this.request("/system/total")
      return response.data || {}
    } catch (error) {
      console.error("Error fetching system total:", error)
      this.setDemoMode(true)
      // Return mock data as fallback
      return {
        system: "Linux CentOS 7.9.2009 x86_64",
        version: "7.9.3",
        time: "31 days, 5 hours, 27 minutes",
        cpuNum: 4,
        cpuRealUsed: 23.5,
        memTotal: 16384,
        memRealUsed: 8192,
        memFree: 6144,
        memCached: 1536,
        memBuffers: 512,
      }
    }
  }

  // Get disk information - Added to match the ServerDashboard component's needs
  async getDiskInfo(): Promise<DiskInfo[]> {
    if (this.isDemoMode) {
      console.log("Demo mode: Returning mock disk information")
      // Return mock disk information
      return [
        {
          path: "/",
          inodes: ["1000000", "250000", "750000", "25%"],
          size: ["100G", "35G", "65G", "35%"],
        },
        {
          path: "/home",
          inodes: ["2000000", "400000", "1600000", "20%"],
          size: ["500G", "125G", "375G", "25%"],
        },
        {
          path: "/var",
          inodes: ["500000", "150000", "350000", "30%"],
          size: ["200G", "80G", "120G", "40%"],
        },
      ]
    }

    try {
      const response = await this.request("/system/disk")
      return response.data || []
    } catch (error) {
      console.error("Error fetching disk info:", error)
      this.setDemoMode(true)
      // Return mock data as fallback
      return [
        {
          path: "/",
          inodes: ["1000000", "250000", "750000", "25%"],
          size: ["100G", "35G", "65G", "35%"],
        },
        {
          path: "/home",
          inodes: ["2000000", "400000", "1600000", "20%"],
          size: ["500G", "125G", "375G", "25%"],
        },
        {
          path: "/var",
          inodes: ["500000", "150000", "350000", "30%"],
          size: ["200G", "80G", "120G", "40%"],
        },
      ]
    }
  }

  // Get network information - Added to match the ServerDashboard component's needs
  async getNetworkInfo(): Promise<NetworkInfo> {
    if (this.isDemoMode) {
      console.log("Demo mode: Returning mock network information")
      // Return mock network information
      return {
        load: {
          max: 8,
          safe: 4,
          one: 1.5,
          five: 2.1,
          limit: 6,
          fifteen: 1.8,
        },
        down: 256,
        downTotal: 1024 * 1024 * 10, // 10 MB
        mem: {
          memFree: 6144,
          memTotal: 16384,
          memCached: 1536,
          memBuffers: 512,
          memRealUsed: 8192,
        },
        up: 128,
        upTotal: 1024 * 1024 * 5, // 5 MB
        upPackets: 1500,
        downPackets: 3000,
        cpu: [23.5, 76.5],
      }
    }

    try {
      const response = await this.request("/system/network")
      return response.data || {}
    } catch (error) {
      console.error("Error fetching network info:", error)
      this.setDemoMode(true)
      // Return mock data as fallback
      return {
        load: {
          max: 8,
          safe: 4,
          one: 1.5,
          five: 2.1,
          limit: 6,
          fifteen: 1.8,
        },
        down: 256,
        downTotal: 1024 * 1024 * 10, // 10 MB
        mem: {
          memFree: 6144,
          memTotal: 16384,
          memCached: 1536,
          memBuffers: 512,
          memRealUsed: 8192,
        },
        up: 128,
        upTotal: 1024 * 1024 * 5, // 5 MB
        upPackets: 1500,
        downPackets: 3000,
        cpu: [23.5, 76.5],
      }
    }
  }

  // Get server status
  async getServerStatus() {
    if (this.isDemoMode) {
      console.log("Demo mode: Simulating server status request")
      // Simulate a successful response with mock data
      return {
        status: true,
        data: {
          cpu: [15.2, 25.6, 10.3],
          memory: { total: 16384, used: 8192 },
          disk: { total: 512000, used: 256000 },
          network: { in: 1024, out: 512 },
          uptime: 1209600,
        },
      }
    }
    return this.request("/system/status")
  }

  // Test connection with improved error handling
  async testConnection() {
    // In demo mode, don't even try to connect
    if (this.isDemoMode) {
      console.log("Demo mode: Skipping connection test")
      return false
    }

    try {
      const response = await this.request("/system/ping")
      return response.status === true
    } catch (error) {
      console.error("Connection test failed:", error)
      this.setDemoMode(true)
      return false
    }
  }
}

// Create a singleton instance
export const aaPanelClient = new AaPanelClient()
