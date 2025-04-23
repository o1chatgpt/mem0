import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/db"
import sharp from "sharp"
import { put } from "@vercel/blob"

export async function GET(request: NextRequest) {
  try {
    // Get file ID from query params
    const fileId = request.nextUrl.searchParams.get("fileId")
    const format = request.nextUrl.searchParams.get("format") || "webp"

    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId parameter" }, { status: 400 })
    }

    // Validate format
    const validFormats = ["webp", "png", "jpeg", "jpg", "avif"]
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Supported formats: webp, png, jpeg, jpg, avif" },
        { status: 400 },
      )
    }

    // Get file info from database
    const supabase = createServerClient()
    const { data: file, error } = await supabase.from("fm_files").select("*").eq("id", fileId).single()

    if (error || !file) {
      console.error("Error fetching file:", error)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Check if we already have a converted version
    const { data: existingConversion } = await supabase
      .from("fm_file_conversions")
      .select("converted_url")
      .eq("file_id", fileId)
      .eq("format", format)
      .single()

    if (existingConversion?.converted_url) {
      return NextResponse.json({ url: existingConversion.converted_url })
    }

    // Check if file is an image that needs conversion
    const supportedInputFormats = [
      "image/heic",
      "image/heif",
      "image/tiff",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ]

    if (!supportedInputFormats.includes(file.mime_type)) {
      return NextResponse.json({ error: "File format not supported for conversion" }, { status: 400 })
    }

    // Fetch the original file
    const response = await fetch(file.blob_url)
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch original file" }, { status: 500 })
    }

    const buffer = await response.arrayBuffer()

    // Convert the image using Sharp
    let convertedBuffer
    try {
      const sharpInstance = sharp(Buffer.from(buffer))

      // Apply conversion based on target format
      switch (format) {
        case "webp":
          convertedBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer()
          break
        case "png":
          convertedBuffer = await sharpInstance.png().toBuffer()
          break
        case "jpeg":
        case "jpg":
          convertedBuffer = await sharpInstance.jpeg({ quality: 80 }).toBuffer()
          break
        case "avif":
          convertedBuffer = await sharpInstance.avif({ quality: 70 }).toBuffer()
          break
        default:
          convertedBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer()
      }
    } catch (conversionError) {
      console.error("Error converting image:", conversionError)
      return NextResponse.json({ error: "Failed to convert image" }, { status: 500 })
    }

    // Upload the converted image to blob storage
    const fileName = file.name.split(".").slice(0, -1).join(".") || file.name
    const blobPath = `conversions/${file.user_id}/${fileId}/${fileName}.${format}`

    const blob = await put(blobPath, convertedBuffer, {
      access: "public",
      contentType: `image/${format}`,
    })

    // Store the conversion in the database
    await supabase.from("fm_file_conversions").insert({
      file_id: fileId,
      format: format,
      converted_url: blob.url,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error in image conversion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
