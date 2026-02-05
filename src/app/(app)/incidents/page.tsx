"use client"

import { useState } from "react"
import Link from "next/link"

const mockIncidents = [
  {
    id: "1",
    title: "Database connection timeout",
    description: "Users experiencing slow database queries",
    system: "user-service",
    environment: "PRODUCTION",
    tier: "CRITICAL",
    status: "INVESTIGATING",
    assignee: {
      firstName: "John",
      lastName: "Doe",
    },
    createdAt: "2024-02-05T14:30:00Z",
  },
  {
    id: "2", 
    title: "API rate limiting issues",
    description: "High traffic causing API throttling",
    system: "api-gateway",
    environment: "PRODUCTION",
    tier: "MAJOR",
    status: "OPEN",
    assignee: null,
    createdAt: "2024-02-05T12:15:00Z",
  },
  {
    id: "3",
    title: "Memory leak in staging",
    description: "Application consuming excessive memory",
    system: "web-app",
    environment: "STAGING",
    tier: "MINOR",
    status: "RESOLVED",
    assignee: {
      firstName: "Alice",
      lastName: "Johnson",
    },
    createdAt: "2024-02-04T09:20:00Z",
  },
]

const statusColors = {
  OPEN: "bg-blue-100 text-blue-800",
  INVESTIGATING: "bg-yellow-100 text-yellow-800", 
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
}

const tierColors = {
  CRITICAL: "bg-red-100 text-red-800",
  MAJOR: "bg-orange-100 text-orange-800",
  MINOR: "bg-blue-100 text-blue-800",
}

const environmentColors = {
  PRODUCTION: "bg-red-100 text-red-800",
  STAGING: "bg-yellow-100 text-yellow-800",
  DEV: "bg-green-100 text-green-800",
}

export default function IncidentsPage() {
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTier, setFilterTier] = useState("all")
  const [filterEnvironment, setFilterEnvironment] = useState("all")

  const filteredIncidents = mockIncidents.filter((incident) => {
    if (filterStatus !== "all" && incident.status !== filterStatus) return false
    if (filterTier !== "all" && incident.tier !== filterTier) return false
    if (filterEnvironment !== "all" && incident.environment !== filterEnvironment) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Log</h1>
          <p className="text-gray-600">Monitor and manage system incidents</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/incidents/dashboard"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Dashboard
          </Link>
          <Link
            href="/incidents/api-docs"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            API Docs
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
              onChange={(e) => setFilterTier(e.target.value)}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
              onChange={(e) => setFilterEnvironment(e.target.value)}
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Environments</option>
              <option value="PRODUCTION">Production</option>
              <option value="STAGING">Staging</option>
              <option value="DEV">Development</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
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
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {incident.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {incident.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                        {incident.system}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          environmentColors[incident.environment as keyof typeof environmentColors]
                        }`}
                      >
                        {incident.environment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tierColors[incident.tier as keyof typeof tierColors]
                        }`}
                      >
                        {incident.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[incident.status as keyof typeof statusColors]
                        }`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incident.assignee 
                        ? `${incident.assignee.firstName} ${incident.assignee.lastName}`
                        : "Unassigned"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/incidents/${incident.id}`}
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

          {filteredIncidents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No incidents found matching your filters.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}