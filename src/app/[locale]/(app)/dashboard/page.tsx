"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

interface DashboardData {
  overview: {
    totalTasks: number
    overdueTasks: number
    openIncidents: number
    teamMembers: number
  }
  recentTasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    dueDate: string | null
    creator: {
      firstName: string | null
      lastName: string | null
      username: string
    }
    assignee: {
      firstName: string | null
      lastName: string | null
      username: string
    } | null
    createdAt: string
  }>
  recentIncidents: Array<{
    id: string
    title: string
    tier: string
    status: string
    environment: string
    assignee: {
      firstName: string | null
      lastName: string | null
      username: string
    } | null
    createdAt: string
  }>
  myAssignedTasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    dueDate: string | null
    creator: {
      firstName: string | null
      lastName: string | null
      username: string
    }
    createdAt: string
  }>
  stats: {
    tasksByStatus: {
      TODO: number
      IN_PROGRESS: number
      DONE: number
    }
    incidentsByTier: {
      CRITICAL: number
      MAJOR: number
      MINOR: number
    }
  }
}

const priorityColors = {
  LOW: "text-green-600",
  MEDIUM: "text-yellow-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600"
}

const statusColors = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800"
}

const tierColors = {
  CRITICAL: "bg-red-100 text-red-800",
  MAJOR: "bg-orange-100 text-orange-800",
  MINOR: "bg-yellow-100 text-yellow-800"
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchDashboardData()
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user.firstName || session?.user.username}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s an overview of your current workload and system status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData?.overview.totalTasks}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/tasks" className="font-medium text-blue-700 hover:text-blue-900">
                View all tasks
              </Link>
            </div>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue Tasks</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData?.overview.overdueTasks}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-red-600">Requires attention</span>
            </div>
          </div>
        </div>

        {/* Open Incidents */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Open Incidents</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData?.overview.openIncidents}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/incidents" className="font-medium text-orange-700 hover:text-orange-900">
                View all incidents
              </Link>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData?.overview.teamMembers}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/team" className="font-medium text-green-700 hover:text-green-900">
                Manage team
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Assigned Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">My Assigned Tasks</h3>
            <div className="space-y-3">
              {dashboardData?.myAssignedTasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No tasks assigned to you</p>
              ) : (
                dashboardData?.myAssignedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[task.status as keyof typeof statusColors]}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    {task.dueDate && (
                      <div className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/tasks" className="text-sm text-blue-600 hover:text-blue-800">
                View all my tasks →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {/* Recent Tasks */}
              {dashboardData?.recentTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      New task <span className="font-medium">&quot;{task.title}&quot;</span> was created
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()} • 
                      by {task.creator.firstName || task.creator.username}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Recent Incidents */}
              {dashboardData?.recentIncidents.slice(0, 2).map((incident) => (
                <div key={incident.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${tierColors[incident.tier as keyof typeof tierColors]}`}>
                        {incident.tier}
                      </span> incident 
                      <span className="font-medium"> &quot;{incident.title}&quot;</span> was reported
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(incident.createdAt).toLocaleDateString()} • {incident.environment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/incidents" className="text-sm text-blue-600 hover:text-blue-800">
                View all activity →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Tasks by Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">To Do</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData?.stats.tasksByStatus.TODO}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData?.stats.tasksByStatus.IN_PROGRESS}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Done</span>
                <span className="text-sm font-medium text-gray-900">{dashboardData?.stats.tasksByStatus.DONE}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Incidents by Tier */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Incidents by Tier</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Critical</span>
                <span className="text-sm font-medium text-red-600">{dashboardData?.stats.incidentsByTier.CRITICAL}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Major</span>
                <span className="text-sm font-medium text-orange-600">{dashboardData?.stats.incidentsByTier.MAJOR}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Minor</span>
                <span className="text-sm font-medium text-yellow-600">{dashboardData?.stats.incidentsByTier.MINOR}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}