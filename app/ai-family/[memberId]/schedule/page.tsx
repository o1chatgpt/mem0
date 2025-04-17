import type React from "react"

interface Props {
  params: {
    id: string
  }
}

const SchedulePage: React.FC<Props> = ({ params }) => {
  return (
    <div>
      <h1>Schedule for AI Family Member: {params.id}</h1>
      {/* Add schedule component or content here */}
      <p>This page will display the schedule for AI family member with ID: {params.id}</p>
    </div>
  )
}

export default SchedulePage
