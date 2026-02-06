"use client"

import { useState } from "react"
import Link from "next/link"

interface ApiEndpoint {
  method: string
  path: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    location: 'header' | 'query' | 'body'
  }>
  requestBody?: {
    type: string
    description: string
    example: Record<string, unknown>
  }
  responses: Array<{
    status: number
    description: string
    example?: Record<string, unknown>
  }>
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/v1/incidents",
    description: "Create a new incident",
    parameters: [
      {
        name: "x-api-key",
        type: "string",
        required: true,
        description: "API key for authentication",
        location: "header"
      }
    ],
    requestBody: {
      type: "application/json",
      description: "Incident data",
      example: {
        title: "Database connection timeout",
        description: "Users experiencing slow database queries",
        system: "user-service",
        environment: "PRODUCTION",
        tier: "CRITICAL",
        metadata: {
          error_code: "DB_TIMEOUT",
          affected_users: 150
        }
      }
    },
    responses: [
      {
        status: 201,
        description: "Incident created successfully",
        example: {
          success: true,
          incident: {
            id: "clx1234567890",
            title: "Database connection timeout",
            system: "user-service",
            environment: "PRODUCTION",
            tier: "CRITICAL",
            status: "OPEN",
            createdAt: "2024-02-05T14:30:00.000Z"
          }
        }
      },
      {
        status: 400,
        description: "Bad request - missing required fields",
        example: {
          error: "Missing required fields: system, environment, tier, title"
        }
      },
      {
        status: 401,
        description: "Unauthorized - invalid API key",
        example: {
          error: "Invalid or missing API key"
        }
      }
    ]
  },
  {
    method: "GET",
    path: "/api/v1/incidents",
    description: "List incidents with optional filtering",
    parameters: [
      {
        name: "x-api-key",
        type: "string",
        required: true,
        description: "API key for authentication",
        location: "header"
      },
      {
        name: "page",
        type: "number",
        required: false,
        description: "Page number (default: 1)",
        location: "query"
      },
      {
        name: "limit",
        type: "number",
        required: false,
        description: "Number of results per page (default: 10)",
        location: "query"
      },
      {
        name: "system",
        type: "string",
        required: false,
        description: "Filter by system name",
        location: "query"
      },
      {
        name: "environment",
        type: "string",
        required: false,
        description: "Filter by environment (PRODUCTION, STAGING, DEV)",
        location: "query"
      },
      {
        name: "tier",
        type: "string",
        required: false,
        description: "Filter by tier (CRITICAL, MAJOR, MINOR)",
        location: "query"
      },
      {
        name: "status",
        type: "string",
        required: false,
        description: "Filter by status (OPEN, INVESTIGATING, RESOLVED, CLOSED)",
        location: "query"
      }
    ],
    responses: [
      {
        status: 200,
        description: "List of incidents",
        example: {
          incidents: [
            {
              id: "clx1234567890",
              title: "Database connection timeout",
              description: "Users experiencing slow database queries",
              system: "user-service",
              environment: "PRODUCTION",
              tier: "CRITICAL",
              status: "INVESTIGATING",
              assignee: {
                id: "usr123",
                username: "john.doe",
                firstName: "John",
                lastName: "Doe"
              },
              createdAt: "2024-02-05T14:30:00.000Z",
              _count: {
                comments: 3
              }
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3
          }
        }
      },
      {
        status: 401,
        description: "Unauthorized - invalid API key",
        example: {
          error: "Invalid or missing API key"
        }
      }
    ]
  }
]

export default function ApiDocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState<number>(0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/incidents" className="hover:text-gray-700">
              Incidents
            </Link>
            <span>→</span>
            <span className="font-medium">API Documentation</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents API Documentation</h1>
          <p className="text-gray-600 mt-2">
            External API for creating and managing incidents programmatically.
          </p>
        </div>
        <Link
          href="/incidents"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
        >
          Back to Incidents
        </Link>
      </div>

      {/* API Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Getting Started</h2>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>Base URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">https://your-domain.com</code>
          </div>
          <div>
            <strong>Authentication:</strong> Include your API key in the <code className="bg-blue-100 px-2 py-1 rounded">x-api-key</code> header
          </div>
          <div>
            <strong>Content-Type:</strong> <code className="bg-blue-100 px-2 py-1 rounded">application/json</code>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h2>
        <p className="text-gray-600 mb-4">
          All API requests require authentication via API key. Include your API key in the request header:
        </p>
        <div className="bg-gray-50 p-4 rounded-md">
          <pre className="text-sm text-gray-800">
{`curl -H "x-api-key: your-api-key-here" \\
     -H "Content-Type: application/json" \\
     https://your-domain.com/api/v1/incidents`}
          </pre>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> Contact your administrator to obtain an API key. API keys should be kept secure and not shared.
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">API Endpoints</h2>
        </div>
        
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {API_ENDPOINTS.map((endpoint, index) => (
                <button
                  key={index}
                  onClick={() => setActiveEndpoint(index)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeEndpoint === index
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        endpoint.method === 'GET'
                          ? 'bg-green-100 text-green-800'
                          : endpoint.method === 'POST'
                          ? 'bg-blue-100 text-blue-800'
                          : endpoint.method === 'PUT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="truncate">{endpoint.path}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {API_ENDPOINTS[activeEndpoint] && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        API_ENDPOINTS[activeEndpoint].method === 'GET'
                          ? 'bg-green-100 text-green-800'
                          : API_ENDPOINTS[activeEndpoint].method === 'POST'
                          ? 'bg-blue-100 text-blue-800'
                          : API_ENDPOINTS[activeEndpoint].method === 'PUT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {API_ENDPOINTS[activeEndpoint].method}
                    </span>
                    <code className="text-lg font-mono text-gray-900">
                      {API_ENDPOINTS[activeEndpoint].path}
                    </code>
                  </div>
                  <p className="text-gray-600">
                    {API_ENDPOINTS[activeEndpoint].description}
                  </p>
                </div>

                {/* Parameters */}
                {API_ENDPOINTS[activeEndpoint].parameters && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Parameters</h3>
                    <div className="overflow-hidden border border-gray-200 rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {API_ENDPOINTS[activeEndpoint].parameters?.map((param, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm font-mono text-gray-900">{param.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{param.type}</td>
                              <td className="px-4 py-2 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    param.required
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {param.required ? 'Required' : 'Optional'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">{param.location}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {API_ENDPOINTS[activeEndpoint].requestBody && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Request Body</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {API_ENDPOINTS[activeEndpoint].requestBody!.description}
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm text-gray-800">
                        {JSON.stringify(API_ENDPOINTS[activeEndpoint].requestBody!.example, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Responses */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Responses</h3>
                  <div className="space-y-4">
                    {API_ENDPOINTS[activeEndpoint].responses.map((response, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                response.status < 300
                                  ? 'bg-green-100 text-green-800'
                                  : response.status < 500
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {response.status}
                            </span>
                            <span className="text-sm text-gray-700">{response.description}</span>
                          </div>
                        </div>
                        {response.example && (
                          <div className="p-4">
                            <pre className="text-sm text-gray-800">
                              {JSON.stringify(response.example, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Types</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Environment</h3>
            <p className="text-sm text-gray-600">Valid values: <code className="bg-gray-100 px-1 rounded">PRODUCTION</code>, <code className="bg-gray-100 px-1 rounded">STAGING</code>, <code className="bg-gray-100 px-1 rounded">DEV</code></p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Tier</h3>
            <p className="text-sm text-gray-600">Valid values: <code className="bg-gray-100 px-1 rounded">CRITICAL</code>, <code className="bg-gray-100 px-1 rounded">MAJOR</code>, <code className="bg-gray-100 px-1 rounded">MINOR</code></p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Status</h3>
            <p className="text-sm text-gray-600">Valid values: <code className="bg-gray-100 px-1 rounded">OPEN</code>, <code className="bg-gray-100 px-1 rounded">INVESTIGATING</code>, <code className="bg-gray-100 px-1 rounded">RESOLVED</code>, <code className="bg-gray-100 px-1 rounded">CLOSED</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}