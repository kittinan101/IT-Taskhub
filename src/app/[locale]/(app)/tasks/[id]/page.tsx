"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { TaskStatus, TaskPriority, Role } from "@prisma/client"
import FileUpload from "@/components/ui/FileUpload"
import AttachmentList from "@/components/ui/AttachmentList"
import { useLocalePath } from "@/lib/navigation"
import { ArrowLeft, Pencil, Trash2, Save, X, Send, Calendar, User, Users, Flag, Clock, CheckCircle2 } from "lucide-react"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import CustomSelect from "@/components/ui/CustomSelect"
import AlertDialog from "@/components/ui/AlertDialog"

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

const statusConfig = {
  TODO: { label: "Todo", dot: "bg-gray-400", bg: "bg-gray-50 text-gray-700 ring-1 ring-gray-200" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-blue-500", bg: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  DONE: { label: "Done", dot: "bg-green-500", bg: "bg-green-50 text-green-700 ring-1 ring-green-200" },
}

const priorityConfig = {
  LOW: { label: "Low", color: "bg-gray-50 text-gray-600 ring-1 ring-gray-200" },
  MEDIUM: { label: "Medium", color: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200" },
  HIGH: { label: "High", color: "bg-orange-50 text-orange-700 ring-1 ring-orange-200" },
  URGENT: { label: "Urgent", color: "bg-red-50 text-red-700 ring-1 ring-red-200" },
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return ""
  return new Date(dateString).toLocaleString()
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set"
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const getUserDisplayName = (user: User | null) => {
  if (!user) return "Unassigned"
  return user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username
}

const getInitials = (user: User | null) => {
  if (!user) return "?"
  if (user.firstName && user.lastName) return `${user.firstName[0]}${user.lastName[0]}`
  return user.username[0]?.toUpperCase() || "?"
}

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const { localePath } = useLocalePath()
  const [task, setTask] = useState<Task | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [addingComment, setAddingComment] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [alertState, setAlertState] = useState<{ open: boolean; title: string; message: string; type: "success" | "error" }>({ open: false, title: "", message: "", type: "success" })

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
        headers: { 'Content-Type': 'application/json' },
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
      fetchTask()
      setAlertState({ open: true, title: "Success", message: "Task updated successfully", type: "success" })
    } catch (err) {
      console.error('Failed to update task:', err)
      setAlertState({ open: true, title: "Error", message: err instanceof Error ? err.message : "Failed to update task", type: "error" })
    }
  }

  const addComment = async () => {
    if (!newComment.trim() || !task) return

    try {
      setAddingComment(true)
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      setNewComment("")
      fetchTask()
    } catch (err) {
      console.error('Failed to add comment:', err)
      setAlertState({ open: true, title: "Error", message: "Failed to add comment", type: "error" })
    } finally {
      setAddingComment(false)
    }
  }

  const deleteTask = async () => {
    if (!task) return
    

    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete task')
      }

      setAlertState({ open: true, title: "Success", message: "Task deleted successfully", type: "success" })
      setTimeout(() => router.push(localePath("/tasks")), 1000)
    } catch (err) {
      console.error('Failed to delete task:', err)
      setAlertState({ open: true, title: "Error", message: err instanceof Error ? err.message : "Failed to delete task", type: "error" })
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
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading task...</p>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{error || "Task not found"}</h3>
          <Link href={localePath("/tasks")} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Tasks
          </Link>
        </div>
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
      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={() => { setShowDeleteConfirm(false); deleteTask(); }}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />
      <AlertDialog
        open={alertState.open}
        onClose={() => setAlertState(s => ({ ...s, open: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between">
        <Link href={localePath("/tasks")} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button onClick={updateTask} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all duration-200">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200">
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <>
              {canEdit && (
                <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all duration-200">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
              )}
              {canDelete && (
                <button onClick={() => setShowDeleteConfirm(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-all duration-200">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Title + Badges */}
      <div>
        {isEditing ? (
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="text-2xl font-bold text-gray-900 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 w-full transition-all duration-200"
          />
        ) : (
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        )}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusConfig[task.status].bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[task.status].dot}`} />
            {statusConfig[task.status].label}
          </span>
          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${priorityConfig[task.priority].color}`}>
            {priorityConfig[task.priority].label}
          </span>
          {task.team && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: task.team.color || '#6366f1' }} />
              {task.team.name}
            </span>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left: 70% */}
        <div className="lg:col-span-7 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Description</h2>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-gray-400 transition-all duration-200"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Comments ({(task.comments || []).length})
            </h2>

            {/* Add Comment */}
            <div className="mb-6">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                  placeholder="Write a comment..."
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={addComment}
                  disabled={!newComment.trim() || addingComment}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-3.5 h-3.5" />
                  {addingComment ? 'Sending...' : 'Comment'}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {(task.comments || []).map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium shrink-0">
                    {getInitials(comment.user)}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getUserDisplayName(comment.user)}
                      </span>
                      <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                        {comment.user.role}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {(task.comments || []).length === 0 && (
              <div className="text-center py-8 text-sm text-gray-400">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Attachments ({(task.attachments || []).length})
            </h2>
            <div className="mb-4">
              <FileUpload
                taskId={task.id}
                onUploadSuccess={() => fetchTask()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              />
            </div>
            <AttachmentList
              attachments={task.attachments}
              canDelete={canEdit || (task.attachments || []).some(att => att.uploader.id === session?.user?.id)}
            />
          </div>
        </div>

        {/* Right Sidebar: 30% */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-5">Details</h2>
            <div className="space-y-5">
              {/* Status */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Status
                </label>
                {isEditing && canEditStatus ? (
                  <CustomSelect
                    value={editForm.status}
                    onChange={(v) => setEditForm({ ...editForm, status: v as TaskStatus })}
                    options={[
                      { value: "TODO", label: "Todo", dot: "bg-gray-400" },
                      { value: "IN_PROGRESS", label: "In Progress", dot: "bg-blue-500" },
                      { value: "DONE", label: "Done", dot: "bg-green-500" },
                    ]}
                  />
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusConfig[task.status].bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[task.status].dot}`} />
                    {statusConfig[task.status].label}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                  <Flag className="w-3.5 h-3.5" /> Priority
                </label>
                {isEditing ? (
                  <CustomSelect
                    value={editForm.priority}
                    onChange={(v) => setEditForm({ ...editForm, priority: v as TaskPriority })}
                    options={[
                      { value: "LOW", label: "Low", dot: "bg-gray-400" },
                      { value: "MEDIUM", label: "Medium", dot: "bg-yellow-400" },
                      { value: "HIGH", label: "High", dot: "bg-orange-500" },
                      { value: "URGENT", label: "Urgent", dot: "bg-red-500" },
                    ]}
                  />
                ) : (
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${priorityConfig[task.priority].color}`}>
                    {priorityConfig[task.priority].label}
                  </span>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                  <User className="w-3.5 h-3.5" /> Assignee
                </label>
                {isEditing ? (
                  <CustomSelect
                    value={editForm.assigneeId}
                    onChange={(v) => setEditForm({ ...editForm, assigneeId: v })}
                    placeholder="Unassigned"
                    options={[
                      { value: "", label: "Unassigned" },
                      ...(users || []).map((user) => ({ value: user.id, label: getUserDisplayName(user) + " (" + user.role + ")" }))
                    ]}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
                      {getInitials(task.assignee)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{getUserDisplayName(task.assignee)}</p>
                      {task.assignee && <p className="text-[10px] text-gray-400">{task.assignee.role}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Team */}
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                  <Users className="w-3.5 h-3.5" /> Team
                </label>
                {isEditing ? (
                  <CustomSelect
                    value={editForm.teamId}
                    onChange={(v) => setEditForm({ ...editForm, teamId: v })}
                    placeholder="No Team"
                    options={[
                      { value: "", label: "No Team" },
                      ...(teams || []).map((team) => ({ value: team.id, label: team.name }))
                    ]}
                  />
                ) : task.team ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: task.team.color || '#6366f1' }} />
                    <span className="text-sm text-gray-900">{task.team.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">No team assigned</span>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-4">
                {/* Start Date */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Start Date
                  </label>
                  {isEditing ? (
                    <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
                  ) : (
                    <p className="text-sm text-gray-900">{formatDate(task.startDate)}</p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Due Date
                  </label>
                  {isEditing ? (
                    <input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200" />
                  ) : (
                    <p className="text-sm text-gray-900">{formatDate(task.dueDate)}</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-4">
                {/* Creator */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                    <User className="w-3.5 h-3.5" /> Created by
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-medium">
                      {getInitials(task.creator)}
                    </div>
                    <span className="text-sm text-gray-900">{getUserDisplayName(task.creator)}</span>
                  </div>
                </div>

                {/* Created */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                    <Clock className="w-3.5 h-3.5" /> Created
                  </label>
                  <p className="text-sm text-gray-500">{formatDateTime(task.createdAt)}</p>
                </div>

                {task.completedAt && (
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </label>
                    <p className="text-sm text-gray-500">{formatDateTime(task.completedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
