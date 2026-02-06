"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TaskStatus, TaskPriority, Role } from "@prisma/client"
import FileUpload from "@/components/ui/FileUpload"
import AttachmentList from "@/components/ui/AttachmentList"

interface User {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  role: Role
}

interface Team {
  id: string
  name: string
  color: string | null
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: User
}

interface Attachment {
  id: string
  filename: string
  size?: number
  mimeType?: string
  createdAt: string
  uploader: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
}

interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  startDate: string | null
  completedAt: string | null
  creator: User
  assignee: User | null
  team: Team | null
  comments: Comment[]
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

const statusColors = {
  TODO: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
}

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return ""
  return new Date(dateString).toLocaleString()
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString()
}

const getUserDisplayName = (user: User | null) => {
  if (!user) return "Unassigned"
  return user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [addingComment, setAddingComment] = useState(false)

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    priority: "MEDIUM" as TaskPriority,
    dueDate: "",
    startDate: "",
    assigneeId: "",
    teamId: ""
  })

  const fetchTask = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/tasks/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Task not found')
        }
        throw new Error('Failed to fetch task')
      }

      const data: Task = await response.json()
      setTask(data)
      
      // Initialize edit form
      setEditForm({
        title: data.title,
        description: data.description || "",
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? data.dueDate.split('T')[0] : "",
        startDate: data.startDate ? data.startDate.split('T')[0] : "",
        assigneeId: data.assignee?.id || "",
        teamId: data.team?.id || ""
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err)
    }
  }

  const updateTask = async () => {
    if (!task) return

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editForm,
          dueDate: editForm.dueDate || null,
          startDate: editForm.startDate || null,
          assigneeId: editForm.assigneeId || null,
          teamId: editForm.teamId || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update task')
      }

      setIsEditing(false)
      fetchTask() // Refresh task data
      alert('Task updated successfully')
    } catch (err) {
      console.error('Failed to update task:', err)
      alert(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const addComment = async () => {
    if (!newComment.trim() || !task) return

    try {
      setAddingComment(true)
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      setNewComment("")
      fetchTask() // Refresh to get new comment
    } catch (err) {
      console.error('Failed to add comment:', err)
      alert('Failed to add comment')
    } finally {
      setAddingComment(false)
    }
  }

  const deleteTask = async () => {
    if (!task) return
    
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete task')
      }

      alert('Task deleted successfully')
      router.push('/tasks')
    } catch (err) {
      console.error('Failed to delete task:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  useEffect(() => {
    if (session) {
      fetchTask()
      fetchUsers()
      fetchTeams()
    }
  }, [session, params.id])

  if (loading) {
    return <div className="text-center py-8">Loading task...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Link href="/tasks" className="text-blue-600 hover:text-blue-800">
          Back to Tasks
        </Link>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">Task not found</div>
        <Link href="/tasks" className="text-blue-600 hover:text-blue-800">
          Back to Tasks
        </Link>
      </div>
    )
  }

  const canEdit = ['ADMIN', 'PM'].includes(session?.user?.role || '') || 
                 task.creator.id === session?.user?.id ||
                 ['BA'].includes(session?.user?.role || '')
  
  const canEditStatus = canEdit || task.assignee?.id === session?.user?.id
  const canDelete = ['ADMIN', 'PM'].includes(session?.user?.role || '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/tasks" className="text-gray-500 hover:text-gray-700">
                  Tasks
                </Link>
              </li>
              <li>
                <span className="text-gray-500">/</span>
              </li>
              <li>
                <span className="text-gray-900">Task Details</span>
              </li>
            </ol>
          </nav>
          
          {isEditing ? (
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 bg-transparent focus:outline-none"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          )}
          
          <div className="mt-2 flex items-center space-x-4">
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                statusColors[task.status]
              }`}
            >
              {task.status.replace("_", " ")}
            </span>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
            {task.team && (
              <div className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: task.team.color || '#3B82F6' }}
                ></span>
                <span className="text-sm text-gray-600">{task.team.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={updateTask}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={deleteTask}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-700">
                {task.description || "No description provided."}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Comments ({task.comments.length})
            </h2>

            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Add a comment..."
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={addComment}
                  disabled={!newComment.trim() || addingComment}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {getUserDisplayName(comment.user)}
                      <span className="ml-2 text-xs text-gray-500">
                        ({comment.user.role})
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(comment.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>

            {task.comments.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Attachments ({task.attachments.length})
            </h2>

            {/* Upload Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Upload Files</h3>
              <FileUpload
                taskId={task.id}
                onUploadSuccess={() => fetchTask()}
                className="border border-gray-300 rounded-lg p-4"
              />
            </div>

            {/* Attachments List */}
            <div>
              <AttachmentList
                attachments={task.attachments}
                canDelete={canEdit || task.attachments.some(att => att.uploader.id === session?.user?.id)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Task Information</h2>
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isEditing && canEditStatus ? (
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      statusColors[task.status]
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                {isEditing ? (
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                {isEditing ? (
                  <select
                    value={editForm.assigneeId}
                    onChange={(e) => setEditForm({ ...editForm, assigneeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {getUserDisplayName(user)} ({user.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-900">
                    {getUserDisplayName(task.assignee)}
                    {task.assignee && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({task.assignee.role})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Team */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team
                </label>
                {isEditing ? (
                  <select
                    value={editForm.teamId}
                    onChange={(e) => setEditForm({ ...editForm, teamId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">No Team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    {task.team ? (
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: task.team.color || '#3B82F6' }}
                        ></span>
                        <span className="text-sm text-gray-900">{task.team.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No team assigned</span>
                    )}
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                ) : (
                  <div className="text-sm text-gray-900">
                    {formatDate(task.startDate) || "Not set"}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                ) : (
                  <div className="text-sm text-gray-900">
                    {formatDate(task.dueDate) || "Not set"}
                  </div>
                )}
              </div>

              {/* Creator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created by
                </label>
                <div className="text-sm text-gray-900">
                  {getUserDisplayName(task.creator)}
                  <span className="ml-2 text-xs text-gray-500">
                    ({task.creator.role})
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created
                </label>
                <div className="text-sm text-gray-500">
                  {formatDateTime(task.createdAt)}
                </div>
              </div>

              {task.completedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completed
                  </label>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(task.completedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}