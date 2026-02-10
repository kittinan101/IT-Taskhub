"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useLocalePath } from "@/lib/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"
import { IncidentSummary } from "@/lib/incidents"

const STATUS_COLORS = {
  OPEN: "#3B82F6",      // Blue
  INVESTIGATING: "#F59E0B", // Amber
  RESOLVED: "#10B981",   // Emerald
  CLOSED: "#6B7280",     // Gray
}

const TIER_COLORS = {
  CRITICAL: "#EF4444",   // Red
  MAJOR: "#F97316",      // Orange
  MINOR: "#3B82F6",      // Blue
}

const ENV_COLORS = {
  PRODUCTION: "#EF4444", // Red
  STAGING: "#F59E0B",    // Amber
  DEV: "#10B981",        // Emerald
}

export default function IncidentDashboardPage() {
  const { data: session } = useSession()
  const { localePath } = useLocalePath()
  const [summary, setSummary] = useState<IncidentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(30) // days

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/incidents/summary?days=${timeRange}`)
      if (!response.ok) {
        throw new Error("Failed to fetch incident summary")
      }
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
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">
          Error: {error || "Failed to load dashboard data"}
        </div>
        <div className="mt-2">
          <Link
            href={localePath("/incidents")}
            className="text-sm text-red-600 hover:text-red-900 underline"
          >
            ← Back to incidents
          </Link>
        </div>
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
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href={localePath("/incidents")} className="hover:text-gray-700">
              Incidents
            </Link>
            <span>→</span>
            <span className="font-medium">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm text-gray-900"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Link
            href={localePath("/incidents")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            View All Incidents
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Incidents</dt>
                <dd className="text-lg font-medium text-gray-900">{summary.summary.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Resolution Rate</dt>
                <dd className="text-lg font-medium text-gray-900">{summary.summary.resolutionRate}%</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">MTTR</dt>
                <dd className="text-lg font-medium text-gray-900">{summary.summary.mttr}h</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${summary.summary.openCritical > 0 ? 'bg-red-500' : 'bg-gray-400'} rounded-md flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.098 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Open Critical</dt>
                <dd className="text-lg font-medium text-gray-900">{summary.summary.openCritical}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Incidents by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieDataForStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={(props: any) => 
                  `${props.name}: ${props.value} (${((props.percent ?? 0) * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
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

        {/* Tier Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Incidents by Tier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieDataForTier}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {pieDataForTier.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Environment Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Incidents by Environment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pieDataForEnv}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {pieDataForEnv.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* System Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Problematic Systems</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.distributions?.systems || []} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Trends (Last {timeRange} days)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={summary.trends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [value, name === 'total' ? 'Total' : (name ?? '').toString().charAt(0).toUpperCase() + (name ?? '').toString().slice(1)]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#6B7280" 
              strokeWidth={2}
              name="Total"
            />
            <Line 
              type="monotone" 
              dataKey="critical" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Critical"
            />
            <Line 
              type="monotone" 
              dataKey="major" 
              stroke="#F97316" 
              strokeWidth={2}
              name="Major"
            />
            <Line 
              type="monotone" 
              dataKey="minor" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Minor"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.summary.recent24h}</div>
            <div className="text-sm text-blue-600">Incidents in last 24h</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.summary.resolved}</div>
            <div className="text-sm text-green-600">Total resolved</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{summary.summary.mttr}</div>
            <div className="text-sm text-yellow-600">Average resolution time (hours)</div>
          </div>
        </div>
      </div>
    </div>
  )
}