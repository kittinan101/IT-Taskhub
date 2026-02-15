"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Role } from "@prisma/client"
import { ArrowLeft, Clock, User, Shield, Server, Globe, MessageSquare, Paperclip } from "lucide-react"
import { 
  IncidentWithDetails, 
  IncidentComment,
  statusColors, 
  tierColors, 
  environmentColors,
  getDisplayName,
  formatDate,
  formatDuration,
  canAssignIncident,
  canChangeStatus
} from "@/lib/incidents"
import FileUpload from "@/components/ui/FileUpload"
import CustomSelect from "@/components/ui/CustomSelect"
import AttachmentList from "@/components/ui/AttachmentList"
import { useLocalePath } from "@/lib/navigation"

const tierHeaderColors: Record<string, string> = {
  CRITICAL: "from-red-600 to-red-700",
  MAJOR: "from-orange-500 to-orange-600",
  MINOR: "from-yellow-500 to-yellow-600",
}

export default function IncidentDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const { localePath } = useLocalePath()
  const incidentId = params.id as string

  const [incident, setIncident] = useState<IncidentWithDetails | null>(null)
  const [users, setUsers] = useState<Array<{ id: string; username: string; firstName: string | null; lastName: string | null; role: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

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
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      })
      if (!response.ok) throw new Error("Failed to update incident")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: selectedAssignee || null }),
      })
      if (!response.ok) throw new Error("Failed to update incident")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      if (!response.ok) throw new Error("Failed to add comment")
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
        <div className="flex items-center gap-3 text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
          <span className="text-sm">Loading incident...</span>
        </div>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="text-sm text-red-700">Error: {error || "Incident not found"}</div>
        <Link
          href={localePath("/incidents")}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to incidents
        </Link>
      </div>
    )
  }

  const userRole = session.user.role as Role
  const userId = session.user.id
  const canAssign = canAssignIncident(userRole)
  const canStatus = canChangeStatus(userRole, userId, incident)

  return (
    <div className="space-y-6">
      {/* Severity Header Bar */}
      <div className={`-mx-4 -mt-4 rounded-b-2xl bg-gradient-to-r ${tierHeaderColors[incident.tier] || "from-gray-500 to-gray-600"} px-6 py-5 text-white sm:-mx-6 sm:-mt-6`}>
        <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
          <Link href={localePath("/incidents")} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Incidents
          </Link>
          <span>/</span>
          <span className="font-medium text-white">{incident.title}</span>
        </div>
        <h1 className="text-2xl font-bold">{incident.title}</h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5" />
            {incident.tier}
          </span>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColors[incident.status as keyof typeof statusColors]}`}>
            {incident.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column — Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          {incident.description && (
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Description</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 bg-gray-50 rounded-lg p-4">
                {incident.description}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
              <Clock className="h-4 w-4" />
              Timeline
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(incident.createdAt)}</span>
              </div>
              {incident.resolvedAt && (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
                  <span className="text-sm text-green-700">Resolved</span>
                  <span className="text-sm font-medium text-green-800">
                    {formatDate(incident.resolvedAt)}
                    <span className="ml-2 text-green-600">({formatDuration(incident.createdAt, incident.resolvedAt)})</span>
                  </span>
                </div>
              )}
              {incident.closedAt && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-600">Closed</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(incident.closedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
              <MessageSquare className="h-4 w-4" />
              Comments
            </h2>
            
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Add a comment..."
                disabled={updating}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || updating}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Adding..." : "Add Comment"}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {(incident.comments || []).length > 0 ? (
                (incident.comments || []).map((comment: IncidentComment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        {getDisplayName(comment.user).charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 rounded-lg bg-gray-50 p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{getDisplayName(comment.user)}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm text-gray-700">{comment.content}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">No comments yet.</p>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
              <Paperclip className="h-4 w-4" />
              Attachments ({incident.attachments?.length || 0})
            </h2>
            <div className="mb-6">
              <FileUpload
                incidentId={incident.id}
                onUploadSuccess={() => fetchIncident()}
                className="rounded-lg border border-dashed border-gray-300 p-4 transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50/30"
              />
            </div>
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

        {/* Right Column — Sidebar */}
        <div className="space-y-5">
          {/* Details Card */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  Tier
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tierColors[incident.tier as keyof typeof tierColors]}`}>
                  {incident.tier}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Globe className="h-4 w-4" />
                  Environment
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${environmentColors[incident.environment as keyof typeof environmentColors]}`}>
                  {incident.environment}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Server className="h-4 w-4" />
                  System
                </span>
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 font-mono text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                  {incident.system}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          {canStatus && (
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Update Status</h3>
              <CustomSelect
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                options={[
                  { value: 'OPEN', label: 'Open', dot: '#ef4444' },
                  { value: 'INVESTIGATING', label: 'Investigating', dot: '#f59e0b' },
                  { value: 'RESOLVED', label: 'Resolved', dot: '#22c55e' },
                  { value: 'CLOSED', label: 'Closed', dot: '#6b7280' },
                ]}
              />
              {selectedStatus !== incident.status && (
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              )}
            </div>
          )}

          {/* Assignment */}
          {canAssign && (
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Assignment</h3>
              <CustomSelect
                value={selectedAssignee}
                onChange={(val) => setSelectedAssignee(val)}
                options={[
                  { value: '', label: 'Unassigned' },
                  ...(users || []).map((user) => ({
                    value: user.id,
                    label: `${getDisplayName(user)} (${user.role})`,
                  })),
                ]}
                placeholder="Select assignee..."
              />
              {selectedAssignee !== (incident.assigneeId || "") && (
                <button
                  onClick={handleAssigneeUpdate}
                  disabled={updating}
                  className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Assignment"}
                </button>
              )}
            </div>
          )}

          {/* Current Assignee */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Current Assignee</h3>
            {incident.assignee ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {getDisplayName(incident.assignee).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{getDisplayName(incident.assignee)}</div>
                  <div className="text-xs text-gray-500">{incident.assignee.role}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User className="h-4 w-4" />
                Unassigned
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
