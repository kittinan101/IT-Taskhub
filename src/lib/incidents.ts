// Role type matching Prisma enum - avoid importing @prisma/client on client side
type Role = "ADMIN" | "PM" | "BA" | "DEVELOPER" | "QA"

export interface IncidentWithDetails {
  id: string
  title: string
  description: string | null
  system: string
  environment: string
  tier: string
  status: string
  assigneeId: string | null
  resolvedAt: Date | null
  closedAt: Date | null
  createdAt: Date
  updatedAt: Date
  assignee?: {
    id: string
    username: string
    firstName: string | null
    lastName: string | null
    role?: string
  } | null
  comments?: IncidentComment[]
  _count?: {
    comments: number
  }
}

export interface IncidentComment {
  id: string
  content: string
  incidentId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    username: string
    firstName: string | null
    lastName: string | null
  }
}

export interface IncidentSummary {
  summary: {
    total: number
    resolved: number
    mttr: number
    recent24h: number
    openCritical: number
    resolutionRate: number
  }
  distributions: {
    status: Array<{ name: string; value: number }>
    tier: Array<{ name: string; value: number }>
    environment: Array<{ name: string; value: number }>
    systems: Array<{ name: string; value: number }>
  }
  trends: Array<{
    date: string
    total: number
    critical: number
    major: number
    minor: number
  }>
}

export const statusColors = {
  OPEN: "bg-blue-100 text-blue-800 border-blue-200",
  INVESTIGATING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  RESOLVED: "bg-green-100 text-green-800 border-green-200",
  CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
}

export const tierColors = {
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  MAJOR: "bg-orange-100 text-orange-800 border-orange-200",
  MINOR: "bg-blue-100 text-blue-800 border-blue-200",
}

export const environmentColors = {
  PRODUCTION: "bg-red-100 text-red-800 border-red-200",
  STAGING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  DEV: "bg-green-100 text-green-800 border-green-200",
}

export function canUpdateIncident(userRole: Role, userId: string, incident: IncidentWithDetails): boolean {
  const isAdmin = userRole === "ADMIN"
  const isPM = userRole === "PM"
  const isAssignee = incident.assigneeId === userId
  
  return isAdmin || isPM || isAssignee
}

export function canAssignIncident(userRole: Role): boolean {
  return userRole === "ADMIN" || userRole === "PM"
}

export function canChangeStatus(userRole: Role, userId: string, incident: IncidentWithDetails): boolean {
  const isAdmin = userRole === "ADMIN"
  const isPM = userRole === "PM"
  const isAssignee = incident.assigneeId === userId
  const isQA = userRole === "QA"
  
  return isAdmin || isPM || isAssignee || isQA
}

export function getDisplayName(user: { firstName: string | null; lastName: string | null; username: string }): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ")
  }
  return user.username
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end
  
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  
  if (diffHours < 1) {
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    return `${diffMinutes}m`
  } else if (diffHours < 24) {
    return `${Math.round(diffHours)}h`
  } else {
    const diffDays = Math.round(diffHours / 24)
    return `${diffDays}d`
  }
}