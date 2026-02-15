"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useLocalePath } from "@/lib/navigation"
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  Users,
  Plus,
  TrendingUp,
  Activity,
} from "lucide-react"
import { SkeletonDashboard } from "@/components/ui/Skeleton"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

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

const priorityConfig: Record<string, { color: string; bg: string; dot: string }> = {
  LOW: { color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  MEDIUM: { color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  HIGH: { color: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500" },
  URGENT: { color: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500" },
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  TODO: { color: "text-slate-700", bg: "bg-slate-100" },
  IN_PROGRESS: { color: "text-indigo-700", bg: "bg-indigo-50" },
  DONE: { color: "text-emerald-700", bg: "bg-emerald-50" },
}

const tierConfig: Record<string, { color: string; bg: string }> = {
  CRITICAL: { color: "text-rose-700", bg: "bg-rose-50" },
  MAJOR: { color: "text-orange-700", bg: "bg-orange-50" },
  MINOR: { color: "text-amber-700", bg: "bg-amber-50" },
}

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981"]
const BAR_COLORS = { URGENT: "#e11d48", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#10b981" }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { localePath } = useLocalePath()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) throw new Error("Failed to fetch dashboard data")
        const data = await response.json()
        setDashboardData(data)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    if (session) fetchDashboardData()
  }, [session])

  if (loading) {
    return <SkeletonDashboard />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-rose-600 text-sm font-medium">{error}</div>
      </div>
    )
  }

  const taskStatusData = dashboardData
    ? [
        { name: "To Do", value: dashboardData.stats.tasksByStatus.TODO },
        { name: "In Progress", value: dashboardData.stats.tasksByStatus.IN_PROGRESS },
        { name: "Done", value: dashboardData.stats.tasksByStatus.DONE },
      ]
    : []

  const priorityCounts: Record<string, number> = {}
  ;(dashboardData?.myAssignedTasks || []).forEach((t) => {
    priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1
  })
  const priorityBarData = ["URGENT", "HIGH", "MEDIUM", "LOW"]
    .filter((p) => priorityCounts[p])
    .map((p) => ({ name: p.charAt(0) + p.slice(1).toLowerCase(), value: priorityCounts[p], fill: BAR_COLORS[p as keyof typeof BAR_COLORS] }))

  const stats = [
    {
      label: "Total Tasks",
      value: dashboardData?.overview.totalTasks ?? 0,
      icon: ClipboardList,
      accent: "indigo",
      link: localePath("/tasks"),
      linkText: "View all",
    },
    {
      label: "Overdue Tasks",
      value: dashboardData?.overview.overdueTasks ?? 0,
      icon: Clock,
      accent: "rose",
      link: null,
      linkText: "Needs attention",
    },
    {
      label: "Open Incidents",
      value: dashboardData?.overview.openIncidents ?? 0,
      icon: AlertTriangle,
      accent: "amber",
      link: localePath("/incidents"),
      linkText: "View all",
    },
    {
      label: "Team Members",
      value: dashboardData?.overview.teamMembers ?? 0,
      icon: Users,
      accent: "emerald",
      link: localePath("/team"),
      linkText: "Manage",
    },
  ]

  const accentMap: Record<string, { iconBg: string; iconText: string; valueBg: string }> = {
    indigo: { iconBg: "bg-indigo-50", iconText: "text-indigo-600", valueBg: "text-indigo-600" },
    rose: { iconBg: "bg-rose-50", iconText: "text-rose-600", valueBg: "text-rose-600" },
    amber: { iconBg: "bg-amber-50", iconText: "text-amber-600", valueBg: "text-amber-600" },
    emerald: { iconBg: "bg-emerald-50", iconText: "text-emerald-600", valueBg: "text-emerald-600" },
  }

  return (
    <div className="space-y-8">
      {/* Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back, {session?.user.firstName || session?.user.username}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s an overview of your current workload and system status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={localePath("/tasks/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-indigo-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Link>
          <Link
            href={localePath("/incidents/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Incident
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => {
          const a = accentMap[s.accent]
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 ${a.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${a.iconText}`} />
                </div>
                {s.link ? (
                  <Link href={s.link} className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">
                    {s.linkText} →
                  </Link>
                ) : (
                  <span className="text-xs font-medium text-rose-400">{s.linkText}</span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-900">Task Status Distribution</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {taskStatusData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "0.8rem" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-900">My Tasks by Priority</h3>
          </div>
          <div className="h-56">
            {priorityBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityBarData} barSize={36}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {priorityBarData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400">
                No tasks assigned yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity + Assigned Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Assigned Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-900">My Assigned Tasks</h3>
            <Link href={localePath("/tasks")} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {(dashboardData?.myAssignedTasks || []).length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No tasks assigned to you</p>
            ) : (
              (dashboardData?.myAssignedTasks || []).slice(0, 5).map((task) => {
                const sc = statusConfig[task.status] || statusConfig.TODO
                const pc = priorityConfig[task.priority] || priorityConfig.MEDIUM
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all duration-200 group/item"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pc.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md ${sc.bg} ${sc.color}`}>
                          {task.status.replace("_", " ")}
                        </span>
                        <span className={`text-[11px] font-medium ${pc.color}`}>{task.priority}</span>
                      </div>
                    </div>
                    {task.dueDate && (
                      <span className="text-[11px] text-slate-400 flex-shrink-0">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
            <Link href={localePath("/incidents")} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {(dashboardData?.recentTasks || []).slice(0, 3).map((task) => {
              const sc = statusConfig[task.status] || statusConfig.TODO
              const name = task.creator.firstName || task.creator.username
              return (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all duration-200">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-indigo-600">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">
                      <span className="font-medium">{name}</span>{" "}
                      created task{" "}
                      <span className="font-medium">&quot;{task.title}&quot;</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md ${sc.bg} ${sc.color}`}>
                        {task.status.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-400">{timeAgo(task.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {(dashboardData?.recentIncidents || []).slice(0, 2).map((incident) => {
              const tc = tierConfig[incident.tier] || tierConfig.MINOR
              const name = incident.assignee?.firstName || incident.assignee?.username || "System"
              return (
                <div key={incident.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all duration-200">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">
                      Incident{" "}
                      <span className="font-medium">&quot;{incident.title}&quot;</span>{" "}
                      reported
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md ${tc.bg} ${tc.color}`}>
                        {incident.tier}
                      </span>
                      <span className="text-[11px] text-slate-400">{incident.environment}</span>
                      <span className="text-[11px] text-slate-400">{timeAgo(incident.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
