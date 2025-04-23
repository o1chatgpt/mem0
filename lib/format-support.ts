/**
 * Utility functions to detect browser support for various file formats
 */

// Check if browser supports AVIF format
export async function supportsAvif(): Promise<boolean> {
  if (typeof window === "undefined") return false

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    // A simple 1x1 AVIF image as a base64 string
    img.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK"
  })
}

// Check if browser supports WebP format
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === "undefined") return false

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=="
  })
}

// Check if browser supports HEIC format (almost always false)
export async function supportsHeic(): Promise<boolean> {
  if (typeof window === "undefined") return false

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    // This will almost always fail as browsers don't support HEIC natively
    img.src = "data:image/heic;base64,AAAA"
  })
}

// Get a list of all supported image formats
export async function getSupportedImageFormats(): Promise<string[]> {
  const formats = ["jpeg", "png", "gif"]

  if (await supportsWebP()) formats.push("webp")
  if (await supportsAvif()) formats.push("avif")
  if (await supportsHeic()) formats.push("heic") // Will almost always be false

  return formats
}
