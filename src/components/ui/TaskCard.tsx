import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

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

const priorityStyles = {
  URGENT: 'priority-border-urgent',
  HIGH: 'priority-border-high',
  MEDIUM: 'priority-border-medium', 
  LOW: 'priority-border-low'
}

const priorityColors = {
  URGENT: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800'
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800', 
  DONE: 'bg-green-100 text-green-800'
}

export default function TaskCard({ task, onStatusChange, className = '' }: TaskCardProps) {
  const displayName = task.assignee
    ? `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || task.assignee.username
    : 'Unassigned'

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  const teamColor = task.assignee?.team?.color || '#3B82F6'

  return (
    <div
      className={`
        task-card bg-white rounded-lg shadow-sm border border-gray-200 
        hover:shadow-md transition-all duration-200 cursor-pointer
        ${priorityStyles[task.priority]}
        ${className}
      `}
    >
      <Link href={`/tasks/${task.id}`}>
        <div className="p-4 space-y-3">
          {/* Header with Priority & Project */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h3>
              {task.project && (
                <p className="text-xs text-gray-500 mt-1">
                  {task.project.code} • {task.project.name}
                </p>
              )}
            </div>
            <span className={`
              inline-flex px-2 py-1 text-xs font-semibold rounded-md
              ${priorityColors[task.priority]}
            `}>
              {task.priority}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Progress Indicator (if has estimated/actual hours) */}
          {(task.estimatedHours || task.actualHours) && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{task.actualHours || 0}h / {task.estimatedHours || 0}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, ((task.actualHours || 0) / (task.estimatedHours || 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            {/* Assignee */}
            <div className="flex items-center space-x-2">
              {task.assignee?.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={displayName}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: teamColor }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs text-gray-600 truncate max-w-20">
                {displayName}
              </span>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className={`
                flex items-center space-x-1 text-xs
                ${isOverdue ? 'text-red-600' : 'text-gray-500'}
              `}>
                <CalendarIcon className="w-3 h-3" />
                <span>
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
                {isOverdue && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded">
                    Overdue
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <span className={`
              inline-flex px-2 py-1 text-xs font-medium rounded-md
              ${statusColors[task.status]}
            `}>
              {task.status.replace('_', ' ')}
            </span>
            
            {task.estimatedHours && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <ClockIcon className="w-3 h-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

/* CSS for line-clamp (add to globals.css if not using Tailwind plugin) */
/*
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
*/