"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { TaskStatus, TaskPriority, Role } from "@prisma/client"

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
  _count: {
    comments: number
  }
  createdAt: string
  updatedAt: string
}

interface TasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
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

export default function TasksPage() {
  const { data: session } = useSession()
  const [view, setView] = useState<"list" | "board">("list")
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assigneeId: "",
    teamId: "",
    search: ""
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0
  })

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        )
      })

      const response = await fetch(`/api/tasks?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const data: TasksResponse = await response.json()
      setTasks(data.tasks)
      setPagination(data.pagination)
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

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      fetchTasks() // Refetch tasks to update the UI
    } catch (err) {
      console.error('Failed to update task status:', err)
      alert('Failed to update task status')
    }
  }

  useEffect(() => {
    if (session) {
      fetchTasks()
      fetchUsers()
      fetchTeams()
    }
  }, [session, filters, pagination.page])

  const resetFilters = () => {
    setFilters({
      status: "",
      priority: "",
      assigneeId: "",
      teamId: "",
      search: ""
    })
  }

  const canCreateTask = session?.user?.role && ['ADMIN', 'PM', 'BA', 'DEVELOPER', 'QA'].includes(session.user.role)
  const canDeleteTask = session?.user?.role && ['ADMIN', 'PM'].includes(session.user.role)

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage your team's tasks and assignments</p>
          </div>
        </div>
        <div className="text-center py-8">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage your team's tasks and assignments</p>
          </div>
        </div>
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage your team's tasks and assignments</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                view === "list"
                  ? "bg-blue-50 text-blue-700 border-blue-500 z-10"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView("board")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                view === "board"
                  ? "bg-blue-50 text-blue-700 border-blue-500 z-10"
                  : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Board View
            </button>
          </div>
          {canCreateTask && (
            <Link
              href="/tasks/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              New Task
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <select
              value={filters.assigneeId}
              onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Assignees</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.teamId}
              onChange={(e) => setFilters({ ...filters, teamId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={resetFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
          <div className="text-sm text-gray-600">
            {pagination.totalCount} task{pagination.totalCount !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {view === "list" ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.description}
                          </div>
                          {task.team && (
                            <div className="flex items-center mt-1">
                              <span 
                                className="w-2 h-2 rounded-full mr-1" 
                                style={{ backgroundColor: task.team.color || '#3B82F6' }}
                              ></span>
                              <span className="text-xs text-gray-500">{task.team.name}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-none ${
                            statusColors[task.status]
                          }`}
                          disabled={
                            !(['ADMIN', 'PM'].includes(session?.user?.role || '') ||
                              task.creatorId === session?.user?.id ||
                              task.assignee?.id === session?.user?.id)
                          }
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            priorityColors[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getUserDisplayName(task.assignee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task._count.comments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                  {pagination.totalCount} results
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination({ ...pagination, page })}
                      className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                        page === pagination.page
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
              <div key={status} className="bg-white rounded-lg p-4 shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {status.replace("_", " ")}
                  <span className="ml-2 text-sm text-gray-500">
                    ({tasks.filter((task) => task.status === status).length})
                  </span>
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer"
                        onClick={() => window.location.href = `/tasks/${task.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </h4>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              priorityColors[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 truncate">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>
                            {getUserDisplayName(task.assignee)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {task._count.comments > 0 && (
                              <span>{task._count.comments} 💬</span>
                            )}
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        </div>
                        {task.team && (
                          <div className="flex items-center mt-2">
                            <span 
                              className="w-2 h-2 rounded-full mr-1" 
                              style={{ backgroundColor: task.team.color || '#3B82F6' }}
                            ></span>
                            <span className="text-xs text-gray-500">{task.team.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}