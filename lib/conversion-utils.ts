/**
 * Utility functions for handling image format conversions
 */

// Function to request image conversion from the server
export async function convertImage(fileId: number | string, format = "webp"): Promise<string | null> {
  try {
    const response = await fetch(`/api/image-convert?fileId=${fileId}&format=${format}`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Image conversion failed:", errorData.error)
      return null
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error("Error requesting image conversion:", error)
    return null
  }
}

// Function to check if a file format needs conversion for preview
export function needsConversion(mimeType: string): boolean {
  const formatsNeedingConversion = ["image/heic", "image/heif", "image/tiff", "image/x-tiff"]

  return formatsNeedingConversion.includes(mimeType.toLowerCase())
}

// Function to get the best target format based on browser support
export async function getBestTargetFormat(): Promise<string> {
  // Check if browser supports AVIF
  if (await supportsAvif()) {
    return "avif" // Best compression, but not all browsers support it
  }

  // WebP is widely supported now
  if (await supportsWebP()) {
    return "webp"
  }

  // Fallback to JPEG which is universally supported
  return "jpeg"
}

// Check if browser supports AVIF
async function supportsAvif(): Promise<boolean> {
  if (typeof window === "undefined") return false

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK"
  })
}

// Check if browser supports WebP
async function supportsWebP(): Promise<boolean> {
  if (typeof window === "undefined") return false

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=="
  })
}
