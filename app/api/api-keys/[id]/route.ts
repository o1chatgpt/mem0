import { NextResponse } from "next/server"
import { deleteApiKeyInDb, updateApiKeyInDb, getApiKeyById } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get("ownerId")

    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID is required" }, { status: 400 })
    }

    const success = await deleteApiKeyInDb(id, ownerId)

    if (!success) {
      return NextResponse.json(
        { error: "API key not found or you don't have permission to delete it" },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await request.json()

    const apiKey = await getApiKeyById(id)

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    const updatedKey = await updateApiKeyInDb(id, data)

    return NextResponse.json(updatedKey)
  } catch (error) {
    console.error("Error updating API key:", error)
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 })
  }
}
