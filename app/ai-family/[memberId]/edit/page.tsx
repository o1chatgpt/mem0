"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Params {
  id: string
}

const EditMemberPage = ({ params }: { params: Params }) => {
  const [member, setMember] = useState(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch(`/api/ai-family/${params.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()
        setMember(data)
        setName(data.name)
        setDescription(data.description)
      } catch (error) {
        console.error("Error fetching member:", error)
      }
    }

    fetchMember()
  }, [params.id])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/ai-family/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      router.push("/ai-family")
      router.refresh()
    } catch (error) {
      console.error("Error updating member:", error)
    }
  }

  if (!member) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Edit AI Family Member</h1>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Name:
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description:
          </label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditMemberPage
