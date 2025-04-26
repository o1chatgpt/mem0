import { createHash } from "crypto"
import { config } from "./config"

// Mock data for when the API is unavailable
const mockSystemInfo = {
  system: "Linux 5.15.0-1041-azure (demo)",
  version: "7.9.0",
  time: "1 day, 4 hours",
  cpuNum: 4,
  cpuRealUsed: 23.5,
  memTotal: 8192,
  memRealUsed: 3584,
  memFree: 4608,
  memCached: 1024,
  memBuffers: 512,
}

const mockDiskInfo = [
  {
    path: "/",
    inodes: ["1000000", "125000", "12.5%", "12.5%"],
    size: ["50GB", "15GB", "35GB", "30%"],
  },
  {
    path: "/home",
    inodes: ["2000000", "400000", "20%", "20%"],
    size: ["100GB", "45GB", "55GB", "45%"],
  },
]

const mockNetworkInfo = {
  load: {
    max: 8,
    safe: 4,
    one: 1.2,
    five: 1.5,
    limit: 8,
    fifteen: 1.8,
  },
  down: 256,
  downTotal: 1024 * 1024 * 10,
  mem: {
    memFree: 4608,
    memTotal: 8192,
    memCached: 1024,
    memBuffers: 512,
    memRealUsed: 3584,
  },
  up: 128,
  upTotal: 1024 * 1024 * 5,
  upPackets: 1000,
  downPackets: 2000,
  cpu: [2.5, 5.0],
}

const mockWebsites = [
  {
    id: 1,
    name: "example.com",
    path: "/www/wwwroot/example.com",
    status: "1",
    ps: "Main company website",
    addtime: "2023-01-15",
    edate: "2024-01-15",
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
    edate: "2024-02-20",
    domain: 1,
    backup_count: 1,
  },
  {
    id: 3,
    name: "store.example.com",
    path: "/www/wwwroot/store.example.com",
    status: "0",
    ps: "E-commerce store",
    addtime: "2023-03-10",
    edate: "2024-03-10",
    domain: 2,
    backup_count: 3,
  },
]

const mockPhpVersions = [
  { version: "74", name: "PHP 7.4" },
  { version: "80", name: "PHP 8.0" },
  { version: "81", name: "PHP 8.1" },
  { version: "82", name: "PHP 8.2" },
]

const mockSiteTypes = [
  { id: 0, name: "Default" },
  { id: 1, name: "WordPress" },
  { id: 2, name: "Laravel" },
  { id: 3, name: "Node.js" },
]

export class AaPanelClient {
  private apiKey: string
  private baseUrl: string
  private cookies = ""
  private mockMode = true // Always use mock mode in preview environment

  constructor(apiKey = config.serverApiKey, baseUrl = config.serverUrl) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    console.log("AaPanelClient initialized in mock mode - no API calls will be made")
  }

  private generateSignature(): { request_time: number; request_token: string } {
    const request_time = Math.floor(Date.now() / 1000)
    const md5ApiKey = createHash("md5").update(this.apiKey).digest("hex")
    const request_token = createHash("md5").update(`${request_time}${md5ApiKey}`).digest("hex")

    return { request_time, request_token }
  }

  private async fetchWithAuth(endpoint: string, data: Record<string, any> = {}): Promise<any> {
    // In mock mode, return mock data based on the endpoint
    if (this.mockMode) {
      console.log(`Mock API call to ${endpoint}`)
      return this.getMockResponse(endpoint)
    }

    // This code will never run in mock mode, but keeping it for reference
    const signature = this.generateSignature()
    const formData = new FormData()

    // Add signature parameters
    formData.append("request_time", signature.request_time.toString())
    formData.append("request_token", signature.request_token)

    // Add other parameters
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString())
    })

    const headers: Record<string, string> = {}
    if (this.cookies) {
      headers["Cookie"] = this.cookies
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      })

      // Save cookies for subsequent requests
      const setCookieHeader = response.headers.get("set-cookie")
      if (setCookieHeader) {
        this.cookies = setCookieHeader
      }

      if (!response.ok) {
        throw new Error(`aaPanel API error: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`aaPanel API fetch error for ${endpoint}:`, error)
      throw error
    }
  }

  // Helper method to return appropriate mock data based on endpoint
  private getMockResponse(endpoint: string): Promise<any> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint.includes("GetSystemTotal")) {
          resolve(mockSystemInfo)
        } else if (endpoint.includes("GetDiskInfo")) {
          resolve(mockDiskInfo)
        } else if (endpoint.includes("GetNetWork")) {
          resolve(mockNetworkInfo)
        } else if (endpoint.includes("getData&table=sites")) {
          resolve({ data: mockWebsites })
        } else if (endpoint.includes("get_site_types")) {
          resolve(mockSiteTypes)
        } else if (endpoint.includes("GetPHPVersion")) {
          resolve(mockPhpVersions)
        } else if (endpoint.includes("AddSite")) {
          // Simulate creating a website
          const newId = Math.max(...mockWebsites.map((site) => site.id)) + 1
          const newWebsite = {
            id: newId,
            name: "new.example.com",
            path: "/www/wwwroot/new.example.com",
            status: "1",
            ps: "New website",
            addtime: new Date().toISOString().split("T")[0],
            edate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            domain: 1,
            backup_count: 0,
          }
          mockWebsites.push(newWebsite)
          resolve({ status: true, msg: "Website created successfully" })
        } else if (endpoint.includes("DeleteSite")) {
          // Simulate deleting a website
          resolve({ status: true, msg: "Website deleted successfully" })
        } else if (endpoint.includes("SiteStop") || endpoint.includes("SiteStart")) {
          // Simulate toggling website status
          resolve({ status: true, msg: "Website status updated successfully" })
        } else if (endpoint.includes("ToBackup")) {
          // Simulate creating a backup
          resolve({ status: true, msg: "Backup created successfully" })
        } else {
          // Default mock response
          resolve({ status: true, msg: "Operation completed successfully" })
        }
      }, 300) // Simulate a 300ms delay
    })
  }

  // System status
  async getSystemTotal(): Promise<any> {
    return this.fetchWithAuth("/system?action=GetSystemTotal")
  }

  async getDiskInfo(): Promise<any> {
    return this.fetchWithAuth("/system?action=GetDiskInfo")
  }

  async getNetworkInfo(): Promise<any> {
    return this.fetchWithAuth("/system?action=GetNetWork")
  }

  async checkForUpdates(): Promise<any> {
    return this.fetchWithAuth("/ajax?action=UpdatePanel", { check: true })
  }

  async updatePanel(): Promise<any> {
    return this.fetchWithAuth("/ajax?action=UpdatePanel", { force: true })
  }

  // Website management
  async getWebsites(page = 1, limit = 15, search = ""): Promise<any> {
    return this.fetchWithAuth("/data?action=getData&table=sites", {
      p: page,
      limit,
      search,
      type: -1,
      order: "id desc",
    })
  }

  async getSiteTypes(): Promise<any> {
    return this.fetchWithAuth("/site?action=get_site_types")
  }

  async getPhpVersions(): Promise<any> {
    return this.fetchWithAuth("/site?action=GetPHPVersion")
  }

  async createWebsite(params: {
    webname: string
    path: string
    type_id: number
    version: string
    port: number
    ps: string
    ftp: boolean
    ftp_username?: string
    ftp_password?: string
    sql: boolean
    codeing?: string
    datauser?: string
    datapassword?: string
  }): Promise<any> {
    // Convert webname to proper format
    const webname =
      typeof params.webname === "string"
        ? JSON.stringify({ domain: params.webname, domainlist: [], count: 0 })
        : params.webname

    return this.fetchWithAuth("/site?action=AddSite", {
      ...params,
      webname,
      type: "PHP",
    })
  }

  async deleteWebsite(
    id: number,
    webname: string,
    options: { ftp?: boolean; database?: boolean; path?: boolean } = {},
  ): Promise<any> {
    return this.fetchWithAuth("/site?action=DeleteSite", {
      id,
      webname,
      ...options,
    })
  }

  async stopWebsite(id: number, name: string): Promise<any> {
    return this.fetchWithAuth("/site?action=SiteStop", { id, name })
  }

  async startWebsite(id: number, name: string): Promise<any> {
    return this.fetchWithAuth("/site?action=SiteStart", { id, name })
  }

  async setWebsiteExpiration(id: number, edate: string): Promise<any> {
    return this.fetchWithAuth("/site?action=SetEdate", { id, edate })
  }

  async setWebsiteNotes(id: number, ps: string): Promise<any> {
    return this.fetchWithAuth("/data?action=setPs&table=sites", { id, ps })
  }

  async getWebsiteBackups(id: number, page = 1, limit = 5): Promise<any> {
    return this.fetchWithAuth("/data?action=getData&table=backup", {
      p: page,
      limit,
      type: 0,
      search: id,
    })
  }

  async createWebsiteBackup(id: number): Promise<any> {
    return this.fetchWithAuth("/site?action=ToBackup", { id })
  }

  async deleteWebsiteBackup(id: number): Promise<any> {
    return this.fetchWithAuth("/site?action=DelBackup", { id })
  }

  async getWebsiteDomains(id: number): Promise<any> {
    return this.fetchWithAuth("/data?action=getData&table=domain", {
      search: id,
      list: true,
    })
  }

  async addDomain(id: number, webname: string, domain: string): Promise<any> {
    return this.fetchWithAuth("/site?action=AddDomain", { id, webname, domain })
  }

  async deleteDomain(id: number, webname: string, domain: string, port: number): Promise<any> {
    return this.fetchWithAuth("/site?action=DelDomain", { id, webname, domain, port })
  }

  async getRewriteList(siteName: string): Promise<any> {
    return this.fetchWithAuth("/site?action=GetRewriteList", { siteName })
  }

  async getFileContent(path: string): Promise<any> {
    return this.fetchWithAuth("/files?action=GetFileBody", { path })
  }

  async saveFileContent(path: string, data: string, encoding = "utf-8"): Promise<any> {
    return this.fetchWithAuth("/files?action=SaveFileBody", { path, data, encoding })
  }

  async getWebsiteRoot(id: number): Promise<any> {
    return this.fetchWithAuth("/data?action=getKey&table=sites&key=path", { id })
  }

  async getWebsiteConfig(id: number, path: string): Promise<any> {
    return this.fetchWithAuth("/site?action=GetDirUserINI", { id, path })
  }

  async setAntiCrossSite(path: string): Promise<any> {
    return this.fetchWithAuth("/site?action=SetDirUserINI", { path })
  }

  async setAccessLogs(id: number): Promise<any> {
    return this.fetchWithAuth("/site?action=logsOpen", { id })
  }

  async setWebsiteRoot(id: number, path: string): Promise<any> {
    return this.fetchWithAuth("/site?action=SetPath", { id, path })
  }

  async setWebsiteRunPath(id: number, runPath: string): Promise<any> {
    return this.fetchWithAuth("/site?action=SetSiteRunPath", { id, runPath })
  }

  async setPasswordAccess(id: number, username: string, password: string): Promise<any> {
    return this.fetchWithAuth("/site?action=SetHasPwd", { id, username, password })
  }

  async disablePasswordAccess(id: number): Promise<any> {
    return this.fetchWithAuth("/site?action=CloseHasPwd", { id })
  }

  async getTrafficLimit(id: number): Promise<any> {
    return this.fetchWithAuth("/site?action=GetLimitNet", { id })
  }

  async setTrafficLimit(id: number, perserver: number, perip: number, limit_rate: number): Promise<any> {
    return this.fetchWithAuth("/site?action=SetLimitNet", { id, perserver, perip, limit_rate })
  }

  async disableTrafficLimit(id: number): Promise<any> {
    return this.fetchWithAuth("/site?action=CloseLimitNet", { id })
  }

  async getDefaultDocument(id: number): Promise<any> {
    return this.fetchWithAuth("/site?action=GetIndex", { id })
  }

  async setDefaultDocument(id: number, index: string): Promise<any> {
    return this.fetchWithAuth("/site?action=SetIndex", { id, index })
  }
}

// Create a singleton instance
export const aaPanelClient = new AaPanelClient()
