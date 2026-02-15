import React from "react"
import { Inbox, ClipboardList, AlertTriangle, Users, LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">{description}</p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function EmptyTasks({ href }: { href?: string }) {
  return (
    <EmptyState
      icon={ClipboardList}
      title="No tasks found"
      description="Get started by creating your first task or adjusting your filters."
      action={{ label: "Create Task", href: href || "/tasks/new" }}
    />
  )
}

export function EmptyIncidents() {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="No incidents found"
      description="Great news! No incidents to display at this time."
    />
  )
}

export function EmptyTeam({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No team members found"
      description="Add team members to get started or adjust your filters."
      action={onAdd ? { label: "Add User", onClick: onAdd } : undefined}
    />
  )
}
