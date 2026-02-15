"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Clock, CheckCircle, Activity, TrendingUp, BarChart3 } from "lucide-react"
import { useLocalePath } from "@/lib/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { IncidentSummary } from "@/lib/incidents"
import CustomSelect from "@/components/ui/CustomSelect"

const STATUS_COLORS = {
  OPEN: "#EF4444",
  INVESTIGATING: "#F59E0B",
  RESOLVED: "#10B981",
  CLOSED: "#6B7280",
}

const TIER_COLORS = {
  CRITICAL: "#EF4444",
  MAJOR: "#F97316",
  MINOR: "#EAB308",
}

const ENV_COLORS = {
  PRODUCTION: "#EF4444",
  STAGING: "#F59E0B",
  DEV: "#3B82F6",
}

export default function IncidentDashboardPage() {
  const { data: session } = useSession()
  const { localePath } = useLocalePath()
  const [summary, setSummary] = useState<IncidentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(30)

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/incidents/summary?days=${timeRange}`)
      if (!response.ok) throw new Error("Failed to fetch incident summary")
      const data: IncidentSummary = await response.json()
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [timeRange])

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Please sign in to view dashboard.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="text-sm text-red-700">Error: {error || "Failed to load dashboard data"}</div>
        <Link href={localePath("/incidents")} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800">
          <ArrowLeft className="h-4 w-4" /> Back to incidents
        </Link>
      </div>
    )
  }

  const pieDataForStatus = (summary.distributions?.status || []).map(item => ({
    ...item,
    fill: STATUS_COLORS[item.name as keyof typeof STATUS_COLORS] || "#6B7280"
  }))

  const pieDataForTier = (summary.distributions?.tier || []).map(item => ({
    ...item,
    fill: TIER_COLORS[item.name as keyof typeof TIER_COLORS] || "#6B7280"
  }))

  const pieDataForEnv = (summary.distributions?.environment || []).map(item => ({
    ...item,
    fill: ENV_COLORS[item.name as keyof typeof ENV_COLORS] || "#6B7280"
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href={localePath("/incidents")} className="inline-flex items-center gap-1.5 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Incidents
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-700">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <CustomSelect
            value={String(timeRange)}
            onChange={(val) => setTimeRange(Number(val))}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
            ]}
          />
          <Link
            href={localePath("/incidents")}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700"
          >
            View All Incidents
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{summary.summary.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">{summary.summary.resolutionRate}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">MTTR</p>
              <p className="text-2xl font-bold text-gray-900">{summary.summary.mttr}h</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${summary.summary.openCritical > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <AlertTriangle className={`h-6 w-6 ${summary.summary.openCritical > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Open Critical</p>
              <p className={`text-2xl font-bold ${summary.summary.openCritical > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {summary.summary.openCritical}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution - Donut */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Activity className="h-5 w-5 text-gray-400" />
            Incidents by Status
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieDataForStatus}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                labelLine={false}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={(props: any) => `${props.name}: ${props.value}`}
                dataKey="value"
              >
                {pieDataForStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Distribution - Bar */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-gray-400" />
            Incidents by Tier
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pieDataForTier}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {pieDataForTier.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Environment Distribution */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">Incidents by Environment</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pieDataForEnv}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {pieDataForEnv.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Systems */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">Top Problematic Systems</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary.distributions?.systems || []} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
          <TrendingUp className="h-5 w-5 text-gray-400" />
          Incident Trends (Last {timeRange} days)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={summary.trends || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [value, name === 'total' ? 'Total' : (name ?? '').toString().charAt(0).toUpperCase() + (name ?? '').toString().slice(1)]}
              contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#6B7280" strokeWidth={2} name="Total" dot={false} />
            <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} name="Critical" dot={false} />
            <Line type="monotone" dataKey="major" stroke="#F97316" strokeWidth={2} name="Major" dot={false} />
            <Line type="monotone" dataKey="minor" stroke="#EAB308" strokeWidth={2} name="Minor" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Quick Stats</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-indigo-50 p-5 text-center">
            <div className="text-3xl font-bold text-indigo-600">{summary.summary.recent24h}</div>
            <div className="mt-1 text-sm font-medium text-indigo-600/80">Incidents in last 24h</div>
          </div>
          <div className="rounded-xl bg-green-50 p-5 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.summary.resolved}</div>
            <div className="mt-1 text-sm font-medium text-green-600/80">Total resolved</div>
          </div>
          <div className="rounded-xl bg-amber-50 p-5 text-center">
            <div className="text-3xl font-bold text-amber-600">{summary.summary.mttr}</div>
            <div className="mt-1 text-sm font-medium text-amber-600/80">Avg resolution time (hours)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
