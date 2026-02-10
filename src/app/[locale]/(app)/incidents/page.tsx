"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  IncidentWithDetails, 
  statusColors, 
  tierColors, 
  environmentColors,
  getDisplayName,
  formatDate
} from "@/lib/incidents"
import { useLocalePath } from "@/lib/navigation"

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Log</h1>
          <p className="text-gray-600">Monitor and manage system incidents</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href={localePath("/incidents/dashboard")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Dashboard
          </Link>
          <Link
            href={localePath("/incidents/api-docs")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            API Docs
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tier
            </label>
            <select
              value={filterTier}
              onChange={(e) => {
                setFilterTier(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm text-gray-900"
            >
              <option value="all">All Tiers</option>
              <option value="CRITICAL">Critical</option>
              <option value="MAJOR">Major</option>
              <option value="MINOR">Minor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment
            </label>
            <select
              value={filterEnvironment}
              onChange={(e) => {
                setFilterEnvironment(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm text-gray-900"
            >
              <option value="all">All Environments</option>
              <option value="PRODUCTION">Production</option>
              <option value="STAGING">Staging</option>
              <option value="DEV">Development</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System
            </label>
            <input
              type="text"
              value={filterSystem}
              onChange={(e) => {
                setFilterSystem(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              placeholder="Filter by system..."
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>

          <button
            onClick={resetFilters}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-sm text-red-700">
              Error: {error}
            </div>
          </div>
        </div>
      )}

      {/* Incidents List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading incidents...</div>
            </div>
          ) : (
            <>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Incident
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        System
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Environment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(incidents || []).map((incident) => (
                      <tr key={incident.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {incident.title}
                            </div>
                            {incident.description && (
                              <div className="text-sm text-gray-500 truncate max-w-md">
                                {incident.description}
                              </div>
                            )}
                            {incident._count?.comments && incident._count.comments > 0 && (
                              <div className="text-xs text-gray-400 mt-1">
                                {incident._count.comments} comment{incident._count.comments !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                            {incident.system}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              environmentColors[incident.environment as keyof typeof environmentColors]
                            }`}
                          >
                            {incident.environment}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              tierColors[incident.tier as keyof typeof tierColors]
                            }`}
                          >
                            {incident.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                              statusColors[incident.status as keyof typeof statusColors]
                            }`}
                          >
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {incident.assignee 
                            ? getDisplayName(incident.assignee)
                            : "Unassigned"
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(incident.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={localePath(`/incidents/${incident.id}`)}
                            className="text-blue-600 hover:text-blue-900"
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
                <div className="text-center py-12">
                  <div className="text-gray-500">No incidents found matching your filters.</div>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                          disabled={pagination.page === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}