"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { needsConversion, convertImage, getBestTargetFormat } from "@/lib/conversion-utils"

interface ImagePreviewProps {
  src: string
  alt: string
  mimeType: string
  fileId?: number | string
  fallbackText?: string
}

export function ImagePreview({ src, alt, mimeType, fileId, fallbackText }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supportsFormat, setSupportsFormat] = useState(true)
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionFailed, setConversionFailed] = useState(false)

  useEffect(() => {
    // Check if the browser supports this image format or if we need conversion
    const checkFormatSupport = async () => {
      // Reset states when src changes
      setLoading(true)
      setError(null)
      setConversionFailed(false)

      // If format needs conversion and we have a fileId, try to convert it
      if (needsConversion(mimeType) && fileId) {
        setSupportsFormat(false)
        setIsConverting(true)

        try {
          // Get the best format based on browser support
          const targetFormat = await getBestTargetFormat()

          // Request conversion
          const convertedImageUrl = await convertImage(fileId, targetFormat)

          if (convertedImageUrl) {
            setConvertedUrl(convertedImageUrl)
            setSupportsFormat(true) // We now have a supported format
          } else {
            setConversionFailed(true)
          }
        } catch (err) {
          console.error("Conversion error:", err)
          setConversionFailed(true)
        } finally {
          setIsConverting(false)
        }
      } else if (mimeType === "image/avif") {
        // Check for AVIF support
        const avifSupport = await testAvifSupport()
        setSupportsFormat(avifSupport)
      } else if (mimeType === "image/webp") {
        // Check for WebP support
        const webpSupport = await testWebPSupport()
        setSupportsFormat(webpSupport)
      } else {
        // Most other formats are well-supported
        setSupportsFormat(true)
      }
    }

    checkFormatSupport()
  }, [mimeType, src, fileId])

  const handleImageLoad = () => {
    setLoading(false)
    setError(null)
  }

  const handleImageError = () => {
    setLoading(false)
    setError("Failed to load image")
  }

  // Test if browser supports AVIF
  const testAvifSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src =
        "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK"
    })
  }

  // Test if browser supports WebP
  const testWebPSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=="
    })
  }

  // Handle manual conversion request
  const handleRequestConversion = async () => {
    if (!fileId) return

    setIsConverting(true)
    setConversionFailed(false)

    try {
      const targetFormat = await getBestTargetFormat()
      const convertedImageUrl = await convertImage(fileId, targetFormat)

      if (convertedImageUrl) {
        setConvertedUrl(convertedImageUrl)
        setSupportsFormat(true)
      } else {
        setConversionFailed(true)
      }
    } catch (err) {
      console.error("Manual conversion error:", err)
      setConversionFailed(true)
    } finally {
      setIsConverting(false)
    }
  }

  // Show converting state
  if (isConverting) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium mb-2">Converting image for preview...</p>
        <p className="text-sm text-gray-500">This may take a moment depending on the image size.</p>
      </div>
    )
  }

  // Show conversion failed state
  if (conversionFailed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>Unable to convert image for preview.</AlertDescription>
        </Alert>

        <div className="text-sm text-gray-500 mb-4">
          {fallbackText || "You can download this file to view it with a compatible application."}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleRequestConversion} variant="outline" size="sm">
            Try Again
          </Button>
          <Button onClick={() => window.open(src, "_blank")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Original
          </Button>
        </div>
      </div>
    )
  }

  // Render a message for unsupported formats
  if (!supportsFormat) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {needsConversion(mimeType)
              ? "This image format requires conversion for preview."
              : "Your browser doesn't support this image format."}
          </AlertDescription>
        </Alert>

        <div className="text-sm text-gray-500 mb-4">
          {fileId
            ? "Click below to convert this image for preview."
            : "You can download this file to view it with a compatible application."}
        </div>

        {fileId ? (
          <Button onClick={handleRequestConversion} variant="outline" size="sm">
            Convert for Preview
          </Button>
        ) : (
          <Button onClick={() => window.open(src, "_blank")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Image
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <img
        src={convertedUrl || src || "/placeholder.svg"}
        alt={alt}
        className="max-h-full max-w-full object-contain"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  )
}
