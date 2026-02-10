"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TaskPriority, Role } from "@prisma/client"
import { useLocalePath } from "@/lib/navigation"

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
        headers: {
          'Content-Type': 'application/json'
        },
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

  // Check permissions
  const canCreateTask = session?.user?.role && ['ADMIN', 'PM', 'BA', 'DEVELOPER', 'QA'].includes(session.user.role)

  if (!session) {
    return <div className="text-center py-8">Please log in to create a task.</div>
  }

  if (!canCreateTask) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">You don&apos;t have permission to create tasks.</div>
        <Link href={localePath("/tasks")} className="text-blue-600 hover:text-blue-800">
          Back to Tasks
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href={localePath("/tasks")} className="text-gray-500 hover:text-gray-700">
                Tasks
              </Link>
            </li>
            <li>
              <span className="text-gray-500">/</span>
            </li>
            <li>
              <span className="text-gray-900">New Task</span>
            </li>
          </ol>
        </nav>
        
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
        <p className="text-gray-600">Fill out the form below to create a new task.</p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={createTask} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description..."
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <select
                  value={form.assigneeId}
                  onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select assignee...</option>
                  {(users || []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {getUserDisplayName(user)} ({user.role})
                    </option>
                  ))}
                </select>
                {!['ADMIN', 'PM'].includes(session?.user?.role || '') && (
                  <p className="mt-1 text-xs text-gray-500">
                    Note: You may only be able to assign tasks to yourself or team members depending on your role.
                  </p>
                )}
              </div>

              {/* Team */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team
                </label>
                <select
                  value={form.teamId}
                  onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select team...</option>
                  {(teams || []).map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href={localePath("/tasks")}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {/* Permission Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="text-sm text-blue-800">
          <h3 className="font-medium mb-2">Permission Notes:</h3>
          <ul className="space-y-1 text-xs">
            <li>• <strong>PM/Admin:</strong> Can create tasks and assign to anyone</li>
            <li>• <strong>BA:</strong> Can create tasks and set priority</li>
            <li>• <strong>Developer/QA:</strong> Can create tasks but may have assignment restrictions</li>
          </ul>
        </div>
      </div>
    </div>
  )
}