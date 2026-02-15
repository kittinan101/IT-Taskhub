"use client"

import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import { useLocalePath } from '@/lib/navigation'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    status: 'TODO' | 'IN_PROGRESS' | 'DONE'
    dueDate?: string
    estimatedHours?: number
    actualHours?: number
    assignee?: {
      id: string
      username: string
      firstName?: string
      lastName?: string
      avatar?: string
      team?: {
        name: string
        color?: string
      }
    }
    project?: {
      name: string
      code: string
    }
  }
  onStatusChange?: (taskId: string, newStatus: string) => void
  className?: string
}

const priorityConfig = {
  URGENT: { dot: 'bg-red-500', border: 'border-l-red-500', badge: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
  HIGH: { dot: 'bg-orange-500', border: 'border-l-orange-500', badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
  MEDIUM: { dot: 'bg-yellow-500', border: 'border-l-yellow-500', badge: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200' },
  LOW: { dot: 'bg-gray-400', border: 'border-l-gray-400', badge: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200' },
}

const statusConfig = {
  TODO: { dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200' },
  IN_PROGRESS: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  DONE: { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
}

export default function TaskCard({ task, onStatusChange, className = '' }: TaskCardProps) {
  const { localePath } = useLocalePath()
  const displayName = task.assignee
    ? `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || task.assignee.username
    : 'Unassigned'

  const initials = task.assignee
    ? (task.assignee.firstName?.[0] || '') + (task.assignee.lastName?.[0] || '') || task.assignee.username[0]?.toUpperCase()
    : '?'

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  const teamColor = task.assignee?.team?.color || '#6366f1'
  const priority = priorityConfig[task.priority]

  return (
    <Link href={localePath(`/tasks/${task.id}`)} className={`block ${className}`}>
      <div className={`
        bg-white rounded-lg border border-gray-100 border-l-[3px] ${priority.border}
        shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
      `}>
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{task.title}</h3>
              {task.project && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {task.project.code} • {task.project.name}
                </p>
              )}
            </div>
            <span className={`shrink-0 inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full ${priority.badge}`}>
              {task.priority}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
          )}

          {/* Progress */}
          {(task.estimatedHours || task.actualHours) && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Progress</span>
                <span>{task.actualHours || 0}h / {task.estimatedHours || 0}h</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div 
                  className="bg-indigo-500 h-1 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((task.actualHours || 0) / (task.estimatedHours || 1)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {task.assignee?.avatar ? (
                <img src={task.assignee.avatar} alt={displayName} className="w-6 h-6 rounded-full" />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
                  style={{ backgroundColor: teamColor }}
                >
                  {initials}
                </div>
              )}
              <span className="text-xs text-gray-500 truncate max-w-[80px]">{displayName}</span>
            </div>

            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                {isOverdue && (
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-medium">Late</span>
                )}
              </div>
            )}
          </div>

          {/* Status + Hours */}
          <div className="flex justify-between items-center">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full ${statusConfig[task.status].badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[task.status].dot}`} />
              {task.status.replace('_', ' ')}
            </span>
            {task.estimatedHours && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
