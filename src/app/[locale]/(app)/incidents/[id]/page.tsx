"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
// import { useRouter } from "next/navigation" // TODO: Add navigation features
import Link from "next/link"
import { Role } from "@prisma/client"
import { 
  IncidentWithDetails, 
  IncidentComment,
  statusColors, 
  tierColors, 
  environmentColors,
  getDisplayName,
  formatDate,
  formatDuration,
  // canUpdateIncident, // TODO: Use for edit permissions
  canAssignIncident,
  canChangeStatus
} from "@/lib/incidents"
import FileUpload from "@/components/ui/FileUpload"
import AttachmentList from "@/components/ui/AttachmentList"
import { useLocalePath } from "@/lib/navigation"

export default function IncidentDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  // const router = useRouter() // TODO: Add navigation features
  const { localePath } = useLocalePath()
  const incidentId = params.id as string

  const [incident, setIncident] = useState<IncidentWithDetails | null>(null)
  const [users, setUsers] = useState<Array<{ id: string; username: string; firstName: string | null; lastName: string | null; role: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Form states
  const [newComment, setNewComment] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedAssignee, setSelectedAssignee] = useState("")

  const fetchIncident = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/incidents/${incidentId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError("Incident not found")
          return
        }
        throw new Error("Failed to fetch incident")
      }

      const data = await response.json()
      setIncident(data.incident)
      setSelectedStatus(data.incident.status)
      setSelectedAssignee(data.incident.assigneeId || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [incidentId])

  const fetchUsers = async () => {
    try {
      // For simplicity, we'll use the tasks API to get users, but in a real app you'd have a dedicated users endpoint
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        // Extract unique users from tasks data
        const userMap = new Map()
        data.tasks?.forEach((task: { creator?: { id: string; username: string; firstName?: string; lastName?: string }; assignee?: { id: string; username: string; firstName?: string; lastName?: string } }) => {
          if (task.creator) userMap.set(task.creator.id, task.creator)
          if (task.assignee) userMap.set(task.assignee.id, task.assignee)
        })
        setUsers(Array.from(userMap.values()))
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    }
  }

  useEffect(() => {
    if (incidentId) {
      fetchIncident()
      fetchUsers()
    }
  }, [incidentId])

  const handleStatusUpdate = async () => {
    if (!incident || selectedStatus === incident.status) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update incident")
      }

      await fetchIncident()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update incident")
    } finally {
      setUpdating(false)
    }
  }

  const handleAssigneeUpdate = async () => {
    if (!incident || selectedAssignee === (incident.assigneeId || "")) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigneeId: selectedAssignee || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update incident")
      }

      await fetchIncident()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update incident")
    } finally {
      setUpdating(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/incidents/${incidentId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      setNewComment("")
      await fetchIncident()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment")
    } finally {
      setUpdating(false)
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Please sign in to view incidents.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading incident...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">
          Error: {error}
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

  if (!incident) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Incident not found.</div>
        <div className="mt-2">
          <Link
            href={localePath("/incidents")}
            className="text-blue-600 hover:text-blue-900 underline"
          >
            ← Back to incidents
          </Link>
        </div>
      </div>
    )
  }

  const userRole = session.user.role as Role
  const userId = session.user.id
  // const canUpdate = canUpdateIncident(userRole, userId, incident) // TODO: Use for edit permissions
  const canAssign = canAssignIncident(userRole)
  const canStatus = canChangeStatus(userRole, userId, incident)

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
            <span className="font-medium">{incident.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">System</label>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                    {incident.system}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Environment</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                      environmentColors[incident.environment as keyof typeof environmentColors]
                    }`}
                  >
                    {incident.environment}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tier</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                      tierColors[incident.tier as keyof typeof tierColors]
                    }`}
                  >
                    {incident.tier}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                      statusColors[incident.status as keyof typeof statusColors]
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              {incident.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                    {incident.description}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-medium">{formatDate(incident.createdAt)}</span>
                  </div>
                  {incident.resolvedAt && (
                    <div className="flex justify-between">
                      <span>Resolved:</span>
                      <span className="font-medium">
                        {formatDate(incident.resolvedAt)}
                        <span className="text-gray-400 ml-1">
                          ({formatDuration(incident.createdAt, incident.resolvedAt)})
                        </span>
                      </span>
                    </div>
                  )}
                  {incident.closedAt && (
                    <div className="flex justify-between">
                      <span>Closed:</span>
                      <span className="font-medium">{formatDate(incident.closedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
            
            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex space-x-3">
                <div className="min-w-0 flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    placeholder="Add a comment..."
                    disabled={updating}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newComment.trim() || updating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Adding..." : "Add Comment"}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {(incident.comments || []).length > 0 ? (
                (incident.comments || []).map((comment: IncidentComment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {getDisplayName(comment.user).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {getDisplayName(comment.user)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No comments yet.</div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Attachments ({incident.attachments?.length || 0})
            </h2>

            {/* Upload Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Upload Files</h3>
              <FileUpload
                incidentId={incident.id}
                onUploadSuccess={() => fetchIncident()}
                className="border border-gray-300 rounded-lg p-4"
              />
            </div>

            {/* Attachments List */}
            <div>
              <AttachmentList
                attachments={incident.attachments?.map(att => ({
                  ...att,
                  createdAt: att.createdAt.toISOString()
                })) || []}
                canDelete={session?.user?.role === 'ADMIN' || 
                          incident.assigneeId === session?.user?.id ||
                          (incident.attachments || []).some(att => att.uploader.id === session?.user?.id)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          {canStatus && (
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Update Status</h3>
              <div className="space-y-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm text-gray-900"
                  disabled={updating}
                >
                  <option value="OPEN">Open</option>
                  <option value="INVESTIGATING">Investigating</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
                {selectedStatus !== incident.status && (
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Assignment */}
          {canAssign && (
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Assignment</h3>
              <div className="space-y-3">
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm text-gray-900"
                  disabled={updating}
                >
                  <option value="">Unassigned</option>
                  {(users || []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {getDisplayName(user)} ({user.role})
                    </option>
                  ))}
                </select>
                {selectedAssignee !== (incident.assigneeId || "") && (
                  <button
                    onClick={handleAssigneeUpdate}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Update Assignment"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Current Assignment Display */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Current Assignment</h3>
            <div className="text-sm text-gray-600">
              {incident.assignee ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {getDisplayName(incident.assignee).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {getDisplayName(incident.assignee)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {incident.assignee.role}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">Unassigned</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}