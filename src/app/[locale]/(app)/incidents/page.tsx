"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { EmptyIncidents } from "@/components/ui/EmptyState"
import { SkeletonTable } from "@/components/ui/Skeleton"
import { Search, Filter, AlertTriangle, LayoutDashboard, FileText, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { 
  IncidentWithDetails, 
  statusColors, 
  tierColors, 
  environmentColors,
  getDisplayName,
  formatDate
} from "@/lib/incidents"
import { useLocalePath } from "@/lib/navigation"
import CustomSelect from "@/components/ui/CustomSelect"

interface IncidentsResponse {
  incidents: IncidentWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function IncidentsPage() {
  const { data: session } = useSession()
  const { localePath } = useLocalePath()
  const [incidents, setIncidents] = useState<IncidentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTier, setFilterTier] = useState("all")
  const [filterEnvironment, setFilterEnvironment] = useState("all")
  const [filterSystem, setFilterSystem] = useState("")

  const fetchIncidents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filterStatus !== "all") params.append("status", filterStatus)
      if (filterTier !== "all") params.append("tier", filterTier)
      if (filterEnvironment !== "all") params.append("environment", filterEnvironment)
      if (filterSystem) params.append("system", filterSystem)

      const response = await fetch(`/api/incidents?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch incidents")
      }

      const data: IncidentsResponse = await response.json()
      setIncidents(data.incidents)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [pagination.page, filterStatus, filterTier, filterEnvironment, filterSystem])

  const resetFilters = () => {
    setFilterStatus("all")
    setFilterTier("all") 
    setFilterEnvironment("all")
    setFilterSystem("")
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Please sign in to view incidents.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Log</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and manage system incidents</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={localePath("/incidents/dashboard")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href={localePath("/incidents/api-docs")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow"
          >
            <FileText className="h-4 w-4" />
            API Docs
          </Link>
          <Link
            href={localePath("/incidents")}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          <div className="flex-1 flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <CustomSelect
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'OPEN', label: 'Open', dot: '#ef4444' },
                  { value: 'INVESTIGATING', label: 'Investigating', dot: '#f59e0b' },
                  { value: 'RESOLVED', label: 'Resolved', dot: '#22c55e' },
                  { value: 'CLOSED', label: 'Closed', dot: '#6b7280' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tier</label>
              <CustomSelect
                value={filterTier}
                onChange={(val) => {
                  setFilterTier(val)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                options={[
                  { value: 'all', label: 'All Tiers' },
                  { value: 'CRITICAL', label: 'Critical', dot: '#ef4444' },
                  { value: 'MAJOR', label: 'Major', dot: '#f97316' },
                  { value: 'MINOR', label: 'Minor', dot: '#eab308' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Environment</label>
              <CustomSelect
                value={filterEnvironment}
                onChange={(val) => {
                  setFilterEnvironment(val)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                options={[
                  { value: 'all', label: 'All Environments' },
                  { value: 'PRODUCTION', label: 'Production', dot: '#ef4444' },
                  { value: 'STAGING', label: 'Staging', dot: '#eab308' },
                  { value: 'DEV', label: 'Development', dot: '#3b82f6' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">System</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filterSystem}
                  onChange={(e) => {
                    setFilterSystem(e.target.value)
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  placeholder="Search system..."
                  className="block w-48 rounded-lg border-gray-200 bg-gray-50 pl-9 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-700">Error: {error}</div>
        </div>
      )}

      {/* Incidents Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={6} cols={7} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Incident
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      System
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Environment
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Tier
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Assignee
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                    <th className="relative px-6 py-3.5">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(incidents || []).map((incident) => (
                    <tr key={incident.id} className="transition-all duration-200 hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {incident.title}
                          </div>
                          {incident.description && (
                            <div className="mt-0.5 text-sm text-gray-500 truncate max-w-md">
                              {incident.description}
                            </div>
                          )}
                          {incident._count?.comments && incident._count.comments > 0 && (
                            <div className="mt-1 text-xs text-gray-400">
                              {incident._count.comments} comment{incident._count.comments !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                          {incident.system}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            environmentColors[incident.environment as keyof typeof environmentColors]
                          }`}
                        >
                          {incident.environment}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            tierColors[incident.tier as keyof typeof tierColors]
                          }`}
                        >
                          {incident.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            statusColors[incident.status as keyof typeof statusColors]
                          }`}
                        >
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {incident.assignee 
                          ? getDisplayName(incident.assignee)
                          : <span className="text-gray-400">Unassigned</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(incident.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={localePath(`/incidents/${incident.id}`)}
                          className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 transition-all duration-200 hover:bg-indigo-50"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {incidents.length === 0 && !loading && (
              <EmptyIncidents />
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-700">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium text-gray-700">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium text-gray-700">{pagination.total}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
