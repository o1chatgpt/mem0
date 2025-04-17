import { TaskDetail } from "@/components/TaskDetail"

interface Props {
  params: { taskId: string }
}

export default async function TaskPage({ params }: Props) {
  const { taskId } = params

  return (
    <div>
      <TaskDetail taskId={taskId} />
    </div>
  )
}
