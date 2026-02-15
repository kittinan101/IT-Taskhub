"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { TaskStatus, TaskPriority, Role } from "@prisma/client"
import { useLocalePath } from "@/lib/navigation"
import { EmptyTasks } from "@/components/ui/EmptyState"
import { SkeletonTable } from "@/components/ui/Skeleton"
import { Search, List, LayoutGrid, Plus, ChevronLeft, ChevronRight, X, MessageSquare, Calendar } from "lucide-react"
import AlertDialog from "@/components/ui/AlertDialog"
import CustomSelect from "@/components/ui/CustomSelect"

interface Team {
  id: string
  name: string
  color: string | null
}

interface User {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  role: Role
  team?: Team | null
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

const formatDate = (dateString: string | null) => {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })
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

export default function TasksPage() {
  const { data: session } = useSession()
  const { localePath } = useLocalePath()
  const [view, setView] = useState<"list" | "board">("list")
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [alertState, setAlertState] = useState<{ open: boolean; title: string; message: string; type: "success" | "error" }>({ open: false, title: "", message: "", type: "error" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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
          Object.entries(filters).filter(([, value]) => value)
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

      fetchTasks()
    } catch (err) {
      console.error('Failed to update task status:', err)
      setAlertState({ open: true, title: "Error", message: "Failed to update task status", type: "error" })
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

  const hasActiveFilters = Object.values(filters).some(v => v)
  const canCreateTask = session?.user?.role && ['ADMIN', 'PM', 'BA', 'DEVELOPER', 'QA'].includes(session.user.role)

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <SkeletonTable rows={6} cols={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button onClick={fetchTasks} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AlertDialog
        open={alertState.open}
        onClose={() => setAlertState(s => ({ ...s, open: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your team&apos;s tasks and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setView("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                view === "board"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Board
            </button>
          </div>
          {canCreateTask && (
            <Link
              href={localePath("/tasks/new")}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Task
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-gray-400 transition-all duration-200"
            />
          </div>
          <CustomSelect
            value={filters.status}
            onChange={(val) => setFilters({ ...filters, status: val })}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'TODO', label: 'Todo', dot: '#9ca3af' },
              { value: 'IN_PROGRESS', label: 'In Progress', dot: '#3b82f6' },
              { value: 'DONE', label: 'Done', dot: '#22c55e' },
            ]}
          />
          <CustomSelect
            value={filters.priority}
            onChange={(val) => setFilters({ ...filters, priority: val })}
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'LOW', label: 'Low', dot: '#9ca3af' },
              { value: 'MEDIUM', label: 'Medium', dot: '#eab308' },
              { value: 'HIGH', label: 'High', dot: '#f97316' },
              { value: 'URGENT', label: 'Urgent', dot: '#ef4444' },
            ]}
          />
          <CustomSelect
            value={filters.assigneeId}
            onChange={(val) => setFilters({ ...filters, assigneeId: val })}
            options={[
              { value: '', label: 'All Assignees' },
              ...(users || []).map((user) => ({
                value: user.id,
                label: getUserDisplayName(user),
              })),
            ]}
          />
          <CustomSelect
            value={filters.teamId}
            onChange={(val) => setFilters({ ...filters, teamId: val })}
            options={[
              { value: '', label: 'All Teams' },
              ...(teams || []).map((team) => ({
                value: team.id,
                label: team.name,
              })),
            ]}
          />
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
        <div className="mt-3 text-xs text-gray-400">
          {pagination.totalCount} task{pagination.totalCount !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* List View */}
      {view === "list" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(tasks || []).map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div>
                      <Link href={localePath(`/tasks/${task.id}`)} className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>
                      )}
                      {task.assignee?.team && (
                        <div className="flex items-center mt-1 gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.assignee.team.color || '#6366f1' }} />
                          <span className="text-xs text-gray-400">{task.assignee.team.name}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CustomSelect
                      value={task.status}
                      onChange={(val) => updateTaskStatus(task.id, val as TaskStatus)}
                      options={[
                        { value: 'TODO', label: 'Todo', dot: '#9ca3af' },
                        { value: 'IN_PROGRESS', label: 'In Progress', dot: '#3b82f6' },
                        { value: 'DONE', label: 'Done', dot: '#22c55e' },
                      ]}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${priorityConfig[task.priority].color}`}>
                      {priorityConfig[task.priority].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
                        {getInitials(task.assignee)}
                      </div>
                      <span className="text-sm text-gray-700">{getUserDisplayName(task.assignee)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(task.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {task._count.comments}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={localePath(`/tasks/${task.id}`)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tasks.length === 0 && (
            <EmptyTasks href={localePath("/tasks/new")} />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === pagination.page
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => {
            const config = statusConfig[status]
            const columnTasks = (tasks || []).filter((task) => task.status === status)
            return (
              <div key={status} className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center gap-2 px-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                  <h3 className="text-sm font-semibold text-gray-700">{config.label}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    {columnTasks.length}
                  </span>
                </div>
                {/* Cards */}
                <div className="space-y-3 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => window.location.href = localePath(`/tasks/${task.id}`)}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {task.title}
                        </h4>
                        <span className={`shrink-0 inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${priorityConfig[task.priority].color}`}>
                          {priorityConfig[task.priority].label}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-medium">
                            {getInitials(task.assignee)}
                          </div>
                          <span className="text-xs text-gray-500 truncate max-w-[80px]">
                            {getUserDisplayName(task.assignee)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {task._count.comments > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {task._count.comments}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                      {task.assignee?.team && (
                        <div className="flex items-center mt-2 gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.assignee.team.color || '#6366f1' }} />
                          <span className="text-[10px] text-gray-400">{task.assignee.team.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
