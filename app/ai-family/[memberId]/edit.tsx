"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Params {
  params: {
    memberId: string
  }
}

const AIFamilyMemberEdit = ({ params }: Params) => {
  const [member, setMember] = useState(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()

  const { memberId } = params

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch(`/api/ai-family/${memberId}`)
        if (response.ok) {
          const data = await response.json()
          setMember(data)
          setName(data.name)
          setDescription(data.description)
        } else {
          console.error("Failed to fetch member")
        }
      } catch (error) {
        console.error("Error fetching member:", error)
      }
    }

    fetchMember()
  }, [memberId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/ai-family/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      })

      if (response.ok) {
        router.push("/ai-family")
        router.refresh()
      } else {
        console.error("Failed to update member")
      }
    } catch (error) {
      console.error("Error updating member:", error)
    }
  }

  if (!member) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Edit AI Family Member</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  )
}

export default AIFamilyMemberEdit
