"use client"

import React from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  UserCircleIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useLocalePath } from '@/lib/navigation'

interface IncidentListProps {
  incidents: Array<{
    id: string
    title: string
    description?: string
    tier: 'CRITICAL' | 'MAJOR' | 'MINOR'
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'
    environment: 'PRODUCTION' | 'STAGING' | 'DEV'
    system: string
    assignee?: {
      id: string
      username: string
      firstName?: string
      lastName?: string
    }
    createdAt: string
    resolvedAt?: string
    escalatedAt?: string
    escalationLevel: number
  }>
  onStatusChange?: (incidentId: string, newStatus: string) => void
  className?: string
}

const severityConfig = {
  CRITICAL: {
    icon: ExclamationTriangleIcon,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    pulse: 'animate-pulse'
  },
  MAJOR: {
    icon: ExclamationTriangleIcon,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    pulse: ''
  },
  MINOR: {
    icon: ExclamationTriangleIcon,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    pulse: ''
  }
}

const statusConfig = {
  OPEN: { icon: ClockIcon, color: 'text-red-600', bg: 'bg-red-100' },
  INVESTIGATING: { icon: ClockIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
  RESOLVED: { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100' },
  CLOSED: { icon: XCircleIcon, color: 'text-gray-600', bg: 'bg-gray-100' }
}

const environmentColors = {
  PRODUCTION: 'bg-red-100 text-red-800',
  STAGING: 'bg-yellow-100 text-yellow-800',
  DEV: 'bg-green-100 text-green-800'
}

export default function IncidentList({ incidents, onStatusChange, className = '' }: IncidentListProps) {
  const { localePath } = useLocalePath()
  
  if (!incidents.length) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents</h3>
        <p className="mt-1 text-sm text-gray-500">
          Great! No incidents to display at this time.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {incidents.map((incident) => {
        const severity = severityConfig[incident.tier]
        const status = statusConfig[incident.status]
        const SeverityIcon = severity.icon
        const StatusIcon = status.icon
        
        const assigneeName = incident.assignee
          ? `${incident.assignee.firstName || ''} ${incident.assignee.lastName || ''}`.trim() 
            || incident.assignee.username
          : 'Unassigned'

        const isEscalated = incident.escalationLevel > 0

        return (
          <Link key={incident.id} href={localePath(`/incidents/${incident.id}`)}>
            <div className={`
              incident-row p-4 border rounded-lg transition-all duration-200
              hover:shadow-md hover:bg-gray-50 cursor-pointer
              ${severity.border} ${severity.bg}
              ${isEscalated ? 'ring-2 ring-red-200' : ''}
            `}>
              <div className="flex items-start space-x-4">
                {/* Severity Icon */}
                <div className={`flex-shrink-0 ${severity.pulse}`}>
                  <SeverityIcon className={`h-5 w-5 ${severity.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {incident.title}
                      </h3>
                      {incident.description && (
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                          {incident.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Severity Badge */}
                    <span className={`
                      inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md ml-4
                      ${severity.color} ${severity.bg} ${severity.border}
                    `}>
                      {incident.tier}
                      {isEscalated && (
                        <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-xs bg-red-500 text-white rounded-full">
                          {incident.escalationLevel}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      {/* System */}
                      <div className="flex items-center space-x-1">
                        <ComputerDesktopIcon className="h-3 w-3" />
                        <span>{incident.system}</span>
                      </div>

                      {/* Environment */}
                      <span className={`
                        px-2 py-1 rounded-md font-medium
                        ${environmentColors[incident.environment]}
                      `}>
                        {incident.environment}
                      </span>

                      {/* Assignee */}
                      {incident.assignee && (
                        <div className="flex items-center space-x-1">
                          <UserCircleIcon className="h-3 w-3" />
                          <span>{assigneeName}</span>
                        </div>
                      )}
                    </div>

                    {/* Time and Status */}
                    <div className="flex items-center space-x-3">
                      <span>
                        {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                      </span>
                      
                      <div className={`
                        flex items-center space-x-1 px-2 py-1 rounded-md
                        ${status.bg} ${status.color}
                      `}>
                        <StatusIcon className="h-3 w-3" />
                        <span className="font-medium">
                          {incident.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Time (if resolved) */}
                  {incident.resolvedAt && (
                    <div className="mt-2 text-xs text-green-600">
                      Resolved in {formatDistanceToNow(
                        new Date(incident.resolvedAt), 
                        { addSuffix: false }
                      )}
                    </div>
                  )}

                  {/* Escalation Notice */}
                  {incident.escalatedAt && (
                    <div className="mt-2 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                      Escalated {formatDistanceToNow(new Date(incident.escalatedAt), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

/* CSS for line-clamp-1 (add to globals.css if needed) */
/*
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
*/