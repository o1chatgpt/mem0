import { NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function GET() {
  // Only return the API key from the server, never expose the actual key
  return NextResponse.json({
    apiKey: config.mem0ApiKey,
    apiUrl: config.mem0ApiUrl,
  })
}
