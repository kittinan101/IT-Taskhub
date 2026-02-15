"use client"

import React from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, Clock, User, Monitor, CheckCircle, XCircle } from 'lucide-react'
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
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    pulse: 'animate-pulse'
  },
  MAJOR: {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    pulse: ''
  },
  MINOR: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    pulse: ''
  }
}

const statusConfig = {
  OPEN: { icon: Clock, color: 'text-red-600', bg: 'bg-red-100 text-red-700' },
  INVESTIGATING: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 text-amber-700' },
  RESOLVED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 text-green-700' },
  CLOSED: { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100 text-gray-600' }
}

const environmentColors = {
  PRODUCTION: 'bg-red-100 text-red-700',
  STAGING: 'bg-yellow-100 text-yellow-700',
  DEV: 'bg-blue-100 text-blue-700'
}

export default function IncidentList({ incidents, className = '' }: IncidentListProps) {
  const { localePath } = useLocalePath()
  
  if (!incidents.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-10 w-10 text-gray-300" />
        <h3 className="mt-3 text-sm font-medium text-gray-900">No incidents</h3>
        <p className="mt-1 text-sm text-gray-500">Great! No incidents to display at this time.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {incidents.map((incident) => {
        const severity = severityConfig[incident.tier]
        const status = statusConfig[incident.status]
        const StatusIcon = status.icon
        
        const assigneeName = incident.assignee
          ? `${incident.assignee.firstName || ''} ${incident.assignee.lastName || ''}`.trim() 
            || incident.assignee.username
          : 'Unassigned'

        const isEscalated = incident.escalationLevel > 0

        return (
          <Link key={incident.id} href={localePath(`/incidents/${incident.id}`)}>
            <div className={`
              rounded-xl border p-4 transition-all duration-200
              hover:shadow-md cursor-pointer bg-white
              ${severity.border}
              ${isEscalated ? 'ring-2 ring-red-200' : ''}
            `}>
              <div className="flex items-start gap-4">
                {/* Severity Icon */}
                <div className={`flex-shrink-0 mt-0.5 ${severity.pulse}`}>
                  <AlertTriangle className={`h-5 w-5 ${severity.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {incident.title}
                      </h3>
                      {incident.description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                          {incident.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Severity Badge */}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${severity.badge}`}>
                      {incident.tier}
                      {isEscalated && (
                        <span className="inline-flex items-center justify-center h-4 w-4 text-[10px] bg-red-500 text-white rounded-full">
                          {incident.escalationLevel}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3.5 w-3.5" />
                        <span>{incident.system}</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 font-medium ${environmentColors[incident.environment]}`}>
                        {incident.environment}
                      </span>
                      {incident.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{assigneeName}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span>{formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}</span>
                      <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${status.bg}`}>
                        <StatusIcon className="h-3 w-3" />
                        <span className="font-medium">{incident.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {incident.resolvedAt && (
                    <div className="mt-2 text-xs text-green-600">
                      Resolved in {formatDistanceToNow(new Date(incident.resolvedAt), { addSuffix: false })}
                    </div>
                  )}

                  {incident.escalatedAt && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2 py-1 text-xs text-red-700">
                      <AlertTriangle className="h-3 w-3" />
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
