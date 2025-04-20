"\"use client"

// Safe check for browser environment
const isBrowser = typeof window !== "undefined"

// Generate a unique device ID or retrieve the existing one
function getDeviceId(): string {
  if (!isBrowser) return "server"

  let deviceId = localStorage.getItem("device_id")
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem("device_id", deviceId)
  }
  return deviceId
}

// Get device name or generate a default one
function getDeviceName(): string {
  if (!isBrowser) return "Server"

  let deviceName = localStorage.getItem("device_name")
  if (!deviceName) {
    // Try to get a meaningful device name
    const userAgent = navigator.userAgent
    let defaultName = "Unknown Device"

    if (/iPhone|iPad|iPod/.test(userAgent)) {
      defaultName = /iPhone/.test(userAgent) ? "iPhone" : /iPad/.test(userAgent) ? "iPad" : "iOS Device"
    } else if (/Android/.test(userAgent)) {
      defaultName = "Android Device"
    } else if (/Mac/.test(userAgent)) {
      defaultName = "Mac"
    } else if (/Windows/.test(userAgent)) {
      defaultName = "Windows PC"
    } else if (/Linux/.test(userAgent)) {
      defaultName = "Linux Device"
    }

    deviceName = `${defaultName} ${Math.floor(Math.random() * 1000)}`
    localStorage.setItem("device_name", deviceName)
  }

  return deviceName
}

export interface SyncStatus {
  lastSynced: string | null
  inProgress: boolean
  error?: string
  devices: SyncDevice[]
  currentDevice: SyncDevice
}

export interface SyncDevice {
  id: string
  name: string
  type: "desktop" | "mobile" | "tablet" | "other"
  osInfo?: string
  browserInfo?: string
  lastSeen: number
}

interface SyncPreference<T> {
  key: string
  value: T
}

class SyncService {
  private userId: string
  private deviceId: string
  private deviceName: string
  private listeners: ((status: SyncStatus) => void)[] = []
  private status: SyncStatus
  private preferences: Record<string, any> = {}

  constructor(userId: string) {
    this.userId = userId
    this.deviceId = getDeviceId()
    this.deviceName = getDeviceName()
    this.status = {
      lastSynced: null,
      inProgress: false,
      devices: [],
      currentDevice: {
        id: this.deviceId,
        name: this.deviceName,
        type: "other",
        lastSeen: Date.now(),
      },
    }
  }

  async initialize(): Promise<void> {
    // Simulate loading devices and preferences
    this.status = {
      ...this.status,
      devices: [
        {
          id: this.deviceId,
          name: this.deviceName,
          type: "other",
          lastSeen: Date.now(),
        },
      ],
    }
    this.notifyListeners()
  }

  async syncNow(): Promise<boolean> {
    this.status = { ...this.status, inProgress: true }
    this.notifyListeners()

    return new Promise((resolve) => {
      setTimeout(() => {
        this.status = {
          ...this.status,
          inProgress: false,
          lastSynced: new Date().toISOString(),
        }
        this.notifyListeners()
        resolve(true)
      }, 1000)
    })
  }

  async setPreference<T>(key: string, value: T): Promise<void> {
    this.preferences[key] = value
    localStorage.setItem(`sync-pref-${key}`, JSON.stringify(value))
  }

  async getPreference<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    const storedValue = localStorage.getItem(`sync-pref-${key}`)
    return storedValue ? JSON.parse(storedValue) : defaultValue
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getStatus(): SyncStatus {
    return this.status
  }

  getDeviceId(): string {
    return this.deviceId
  }

  getDeviceName(): string {
    return this.deviceName
  }

  async renameDevice(newName: string): Promise<boolean> {
    this.deviceName = newName
    localStorage.setItem("device_name", newName)
    return true
  }

  async removeDevice(deviceId: string): Promise<boolean> {
    return true
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener({ ...this.status }))
  }
}

// Create a singleton instance
export const syncService = new SyncService("default-user")
export type SyncDevice = {
  id: string
  name: string
  type: string
  osInfo?: string
  browserInfo?: string
  lastSeen: number
}
