"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TaskPriority, Role } from "@prisma/client"
import { useLocalePath } from "@/lib/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import CustomSelect from "@/components/ui/CustomSelect"

interface User {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  role: Role
  email: string | null
}

interface Team {
  id: string
  name: string
  description: string | null
  color: string | null
}

const getUserDisplayName = (user: User | null) => {
  if (!user) return ""
  return user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username
}

export default function NewTaskPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { localePath } = useLocalePath()
  
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as TaskPriority,
    dueDate: "",
    startDate: "",
    assigneeId: "",
    teamId: ""
  })

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

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority,
          dueDate: form.dueDate || null,
          startDate: form.startDate || null,
          assigneeId: form.assigneeId || null,
          teamId: form.teamId || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create task')
      }

      const task = await response.json()
      router.push(localePath(`/tasks/${task.id}`))
    } catch (err) {
      console.error('Failed to create task:', err)
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchUsers()
      fetchTeams()
    }
  }, [session])

  const canCreateTask = session?.user?.role && ['ADMIN', 'PM', 'BA', 'DEVELOPER', 'QA'].includes(session.user.role)

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-500">Please log in to create a task.</p>
      </div>
    )
  }

  if (!canCreateTask) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Permission Denied</h3>
          <p className="text-sm text-gray-500 mb-4">You don&apos;t have permission to create tasks.</p>
          <Link href={localePath("/tasks")} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Back to Tasks
          </Link>
        </div>
      </div>
    )
  }

  const inputClass = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-gray-400 transition-all duration-200"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link href={localePath("/tasks")} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Tasks
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-sm text-gray-500 mt-1">Fill out the details below to create a new task.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={createTask} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className={labelClass}>Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass} resize-none`}
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label className={labelClass}>Priority</label>
              <CustomSelect
                value={form.priority}
                onChange={(val) => setForm({ ...form, priority: val as TaskPriority })}
                options={[
                  { value: 'LOW', label: 'Low', dot: '#9ca3af' },
                  { value: 'MEDIUM', label: 'Medium', dot: '#eab308' },
                  { value: 'HIGH', label: 'High', dot: '#f97316' },
                  { value: 'URGENT', label: 'Urgent', dot: '#ef4444' },
                ]}
              />
            </div>

            {/* Assignee */}
            <div>
              <label className={labelClass}>Assignee</label>
              <CustomSelect
                value={form.assigneeId}
                onChange={(val) => setForm({ ...form, assigneeId: val })}
                options={[
                  { value: '', label: 'Select assignee...' },
                  ...(users || []).map((user) => ({
                    value: user.id,
                    label: `${getUserDisplayName(user)} (${user.role})`,
                  })),
                ]}
                placeholder="Select assignee..."
              />
            </div>

            {/* Team */}
            <div>
              <label className={labelClass}>Team</label>
              <CustomSelect
                value={form.teamId}
                onChange={(val) => setForm({ ...form, teamId: val })}
                options={[
                  { value: '', label: 'Select team...' },
                  ...(teams || []).map((team) => ({
                    value: team.id,
                    label: team.name,
                  })),
                ]}
                placeholder="Select team..."
              />
            </div>

            {/* Start Date */}
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <Link
              href={localePath("/tasks")}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Permission Notes */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-xs font-medium text-indigo-800 mb-2">Permission Notes</p>
        <ul className="space-y-1 text-xs text-indigo-700">
          <li>• <strong>PM/Admin:</strong> Can create tasks and assign to anyone</li>
          <li>• <strong>BA:</strong> Can create tasks and set priority</li>
          <li>• <strong>Developer/QA:</strong> Can create tasks but may have assignment restrictions</li>
        </ul>
      </div>
    </div>
  )
}
